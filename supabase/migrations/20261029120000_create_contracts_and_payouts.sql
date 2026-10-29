-- ============================================================
-- Worker payouts and contracts
--
-- Rules:
--   * Workers must save a payout method before signing a contract.
--   * Hourly contracts may request one withdrawal every 7 days.
--   * Fixed-rate contracts may request a withdrawal at any time, up
--     to the remaining contract value.
--   * Supported payout methods: mobile money, bank transfer, PayPal.
-- ============================================================

DO $$
BEGIN
  CREATE TYPE public.payout_method AS ENUM ('mobile_money', 'bank_transfer', 'paypal');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.pay_type AS ENUM ('hourly', 'fixed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.contract_status AS ENUM (
    'draft',
    'pending_signature',
    'signed',
    'active',
    'completed',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'approved', 'paid', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ------------------------------------------------------------
-- Payout methods
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.worker_payout_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  method public.payout_method NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT,
  mobile_network TEXT,
  bank_name TEXT,
  routing_number TEXT,
  paypal_email TEXT,
  country TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT worker_payout_methods_mobile_fields CHECK (
    method <> 'mobile_money'
    OR (account_number IS NOT NULL AND mobile_network IS NOT NULL)
  ),
  CONSTRAINT worker_payout_methods_bank_fields CHECK (
    method <> 'bank_transfer'
    OR (account_number IS NOT NULL AND bank_name IS NOT NULL)
  ),
  CONSTRAINT worker_payout_methods_paypal_fields CHECK (
    method <> 'paypal'
    OR paypal_email IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_worker_payout_methods_user_id
  ON public.worker_payout_methods(user_id);

ALTER TABLE public.worker_payout_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view their own payout method"
ON public.worker_payout_methods
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Workers can create their own payout method"
ON public.worker_payout_methods
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Workers can update their own payout method"
ON public.worker_payout_methods
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Workers can delete their own payout method"
ON public.worker_payout_methods
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage payout methods"
ON public.worker_payout_methods
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ------------------------------------------------------------
-- Contracts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID UNIQUE REFERENCES public.proposals(id) ON DELETE SET NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  employer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  terms TEXT,
  pay_type public.pay_type NOT NULL DEFAULT 'fixed',
  hourly_rate NUMERIC(12, 2) CHECK (hourly_rate IS NULL OR hourly_rate >= 0),
  fixed_amount NUMERIC(12, 2) CHECK (fixed_amount IS NULL OR fixed_amount >= 0),
  weekly_hours NUMERIC(5, 2) CHECK (weekly_hours IS NULL OR weekly_hours > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  start_date DATE,
  end_date DATE,
  status public.contract_status NOT NULL DEFAULT 'pending_signature',
  signature_name TEXT,
  signed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT contracts_hourly_rate_required CHECK (
    pay_type <> 'hourly' OR hourly_rate IS NOT NULL
  ),
  CONSTRAINT contracts_fixed_amount_required CHECK (
    pay_type <> 'fixed' OR fixed_amount IS NOT NULL
  ),
  CONSTRAINT contracts_dates_valid CHECK (
    end_date IS NULL OR start_date IS NULL OR end_date >= start_date
  )
);

CREATE INDEX IF NOT EXISTS idx_contracts_worker_id ON public.contracts(worker_id);
CREATE INDEX IF NOT EXISTS idx_contracts_employer_id ON public.contracts(employer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_job_id ON public.contracts(job_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view their own contracts"
ON public.contracts
FOR SELECT
TO authenticated
USING (worker_id = auth.uid());

CREATE POLICY "Employers can view their own contracts"
ON public.contracts
FOR SELECT
TO authenticated
USING (employer_id = auth.uid());

CREATE POLICY "Employers can create contracts for accepted proposals"
ON public.contracts
FOR INSERT
TO authenticated
WITH CHECK (
  employer_id = auth.uid()
  AND proposal_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.proposals
    JOIN public.jobs ON jobs.id = proposals.job_id
    WHERE proposals.id = contracts.proposal_id
      AND proposals.status = 'accepted'
      AND proposals.freelancer_id = contracts.worker_id
      AND proposals.job_id = contracts.job_id
      AND jobs.created_by = auth.uid()
  )
);

CREATE POLICY "Workers can sign their own contracts"
ON public.contracts
FOR UPDATE
TO authenticated
USING (worker_id = auth.uid())
WITH CHECK (worker_id = auth.uid());

CREATE POLICY "Employers can update their own contracts"
ON public.contracts
FOR UPDATE
TO authenticated
USING (employer_id = auth.uid())
WITH CHECK (employer_id = auth.uid());

CREATE POLICY "Admins can manage all contracts"
ON public.contracts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Workers may only fill in signature fields. Contract terms stay frozen.
CREATE OR REPLACE FUNCTION public.protect_contract_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN NEW;
  END IF;

  IF auth.uid() = OLD.worker_id THEN
    IF NEW.proposal_id IS DISTINCT FROM OLD.proposal_id
      OR NEW.job_id IS DISTINCT FROM OLD.job_id
      OR NEW.employer_id IS DISTINCT FROM OLD.employer_id
      OR NEW.worker_id IS DISTINCT FROM OLD.worker_id
      OR NEW.title IS DISTINCT FROM OLD.title
      OR NEW.description IS DISTINCT FROM OLD.description
      OR NEW.terms IS DISTINCT FROM OLD.terms
      OR NEW.pay_type IS DISTINCT FROM OLD.pay_type
      OR NEW.hourly_rate IS DISTINCT FROM OLD.hourly_rate
      OR NEW.fixed_amount IS DISTINCT FROM OLD.fixed_amount
      OR NEW.weekly_hours IS DISTINCT FROM OLD.weekly_hours
      OR NEW.currency IS DISTINCT FROM OLD.currency
      OR NEW.start_date IS DISTINCT FROM OLD.start_date
      OR NEW.end_date IS DISTINCT FROM OLD.end_date
    THEN
      RAISE EXCEPTION 'Workers can only sign the contract, not change its terms';
    END IF;

    IF NEW.status <> 'signed' THEN
      RAISE EXCEPTION 'Workers can only sign the contract';
    END IF;
  END IF;

  -- Signed terms are locked for employers too.
  IF auth.uid() = OLD.employer_id AND OLD.status IN ('signed', 'active', 'completed') THEN
    IF NEW.proposal_id IS DISTINCT FROM OLD.proposal_id
      OR NEW.job_id IS DISTINCT FROM OLD.job_id
      OR NEW.employer_id IS DISTINCT FROM OLD.employer_id
      OR NEW.worker_id IS DISTINCT FROM OLD.worker_id
      OR NEW.title IS DISTINCT FROM OLD.title
      OR NEW.description IS DISTINCT FROM OLD.description
      OR NEW.terms IS DISTINCT FROM OLD.terms
      OR NEW.pay_type IS DISTINCT FROM OLD.pay_type
      OR NEW.hourly_rate IS DISTINCT FROM OLD.hourly_rate
      OR NEW.fixed_amount IS DISTINCT FROM OLD.fixed_amount
      OR NEW.weekly_hours IS DISTINCT FROM OLD.weekly_hours
      OR NEW.currency IS DISTINCT FROM OLD.currency
      OR NEW.start_date IS DISTINCT FROM OLD.start_date
      OR NEW.end_date IS DISTINCT FROM OLD.end_date
    THEN
      RAISE EXCEPTION 'Signed contract terms cannot be changed';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_contract_fields
BEFORE UPDATE ON public.contracts
FOR EACH ROW
EXECUTE FUNCTION public.protect_contract_fields();

-- A saved payout method is mandatory before a contract can be signed.
CREATE OR REPLACE FUNCTION public.require_payout_before_signing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('signed', 'active') AND OLD.status NOT IN ('signed', 'active') THEN
    IF OLD.status NOT IN ('draft', 'pending_signature') THEN
      RAISE EXCEPTION 'Only pending contracts can be signed';
    END IF;

    IF NEW.signature_name IS NULL OR length(trim(NEW.signature_name)) = 0 THEN
      RAISE EXCEPTION 'A signature name is required to sign the contract';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.worker_payout_methods
      WHERE worker_payout_methods.user_id = NEW.worker_id
    ) THEN
      RAISE EXCEPTION 'Set up a payout method before signing the contract';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER require_payout_before_signing
BEFORE UPDATE ON public.contracts
FOR EACH ROW
EXECUTE FUNCTION public.require_payout_before_signing();

CREATE OR REPLACE FUNCTION public.notify_contract_signed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'signed' AND OLD.status IS DISTINCT FROM 'signed' THEN
    IF NEW.employer_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type)
      VALUES (
        NEW.employer_id,
        'Contract signed',
        COALESCE(NEW.signature_name, 'The worker') || ' signed the contract "' || NEW.title || '".',
        'success'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_contract_signed
AFTER UPDATE OF status ON public.contracts
FOR EACH ROW
EXECUTE FUNCTION public.notify_contract_signed();

-- ------------------------------------------------------------
-- Withdrawal requests
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  method public.payout_method NOT NULL,
  payout_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  status public.withdrawal_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id
  ON public.withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_contract_id
  ON public.withdrawal_requests(contract_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status
  ON public.withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_requested_at
  ON public.withdrawal_requests(requested_at);

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view their own withdrawals"
ON public.withdrawal_requests
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Workers can request withdrawals"
ON public.withdrawal_requests
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.worker_payout_methods
    WHERE worker_payout_methods.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1
    FROM public.contracts
    WHERE contracts.id = withdrawal_requests.contract_id
      AND contracts.worker_id = auth.uid()
      AND contracts.status IN ('signed', 'active', 'completed')
  )
);

CREATE POLICY "Admins can manage all withdrawals"
ON public.withdrawal_requests
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Enforce the payout schedule and fixed-contract balance in the database.
CREATE OR REPLACE FUNCTION public.enforce_withdrawal_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  contract_record public.contracts%ROWTYPE;
  already_requested NUMERIC;
BEGIN
  SELECT * INTO contract_record
  FROM public.contracts
  WHERE id = NEW.contract_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contract not found';
  END IF;

  IF contract_record.worker_id <> NEW.user_id THEN
    RAISE EXCEPTION 'You can only withdraw from your own contracts';
  END IF;

  IF contract_record.status NOT IN ('signed', 'active', 'completed') THEN
    RAISE EXCEPTION 'The contract must be signed before withdrawing';
  END IF;

  IF NEW.currency <> contract_record.currency THEN
    RAISE EXCEPTION 'Withdrawal currency must match the contract currency';
  END IF;

  IF contract_record.pay_type = 'fixed' AND contract_record.fixed_amount IS NOT NULL THEN
    SELECT COALESCE(SUM(amount), 0) INTO already_requested
    FROM public.withdrawal_requests
    WHERE contract_id = NEW.contract_id
      AND status <> 'rejected';

    IF NEW.amount > contract_record.fixed_amount - already_requested THEN
      RAISE EXCEPTION 'Withdrawal exceeds the remaining contract balance';
    END IF;
  END IF;

  -- Hourly workers may withdraw once every 7 days per contract.
  IF contract_record.pay_type = 'hourly' THEN
    IF EXISTS (
      SELECT 1
      FROM public.withdrawal_requests
      WHERE contract_id = NEW.contract_id
        AND user_id = NEW.user_id
        AND status <> 'rejected'
        AND requested_at > now() - INTERVAL '7 days'
    ) THEN
      RAISE EXCEPTION 'Hourly contracts can withdraw once every 7 days';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_withdrawal_rules
BEFORE INSERT ON public.withdrawal_requests
FOR EACH ROW
EXECUTE FUNCTION public.enforce_withdrawal_rules();

CREATE OR REPLACE FUNCTION public.notify_withdrawal_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.user_id,
      'Withdrawal ' || NEW.status,
      'Your withdrawal request for ' || NEW.currency || ' ' || NEW.amount || ' is now ' || NEW.status || '.',
      CASE NEW.status
        WHEN 'approved' THEN 'info'
        WHEN 'paid' THEN 'success'
        WHEN 'rejected' THEN 'error'
        ELSE 'info'
      END
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_withdrawal_status_change
AFTER UPDATE OF status ON public.withdrawal_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_withdrawal_status_change();

-- ------------------------------------------------------------
-- Contract parties can see each other's basic profile details
-- ------------------------------------------------------------
CREATE POLICY "Contract parties can view each other's profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.contracts
    WHERE (contracts.worker_id = auth.uid() AND contracts.employer_id = profiles.user_id)
       OR (contracts.employer_id = auth.uid() AND contracts.worker_id = profiles.user_id)
  )
);

-- ------------------------------------------------------------
-- updated_at triggers
-- ------------------------------------------------------------
CREATE TRIGGER update_worker_payout_methods_updated_at
BEFORE UPDATE ON public.worker_payout_methods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
BEFORE UPDATE ON public.contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_withdrawal_requests_updated_at
BEFORE UPDATE ON public.withdrawal_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
