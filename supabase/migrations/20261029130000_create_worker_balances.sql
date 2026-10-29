-- Worker earnings balance ("Connects")

CREATE TABLE IF NOT EXISTS public.worker_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_worker_balances_user_id
  ON public.worker_balances(user_id);

ALTER TABLE public.worker_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view their own balance"
  ON public.worker_balances
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Workers can create their own balance"
  ON public.worker_balances
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Workers can update their own balance"
  ON public.worker_balances
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage balances"
  ON public.worker_balances
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER update_worker_balances_updated_at
BEFORE UPDATE ON public.worker_balances
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Credit a worker's balance whenever a payout is marked as paid.
CREATE OR REPLACE FUNCTION public.credit_worker_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status IS DISTINCT FROM 'paid' THEN
    INSERT INTO public.worker_balances (user_id, balance, currency)
    VALUES (NEW.user_id, NEW.amount, NEW.currency)
    ON CONFLICT (user_id) DO UPDATE
      SET balance = public.worker_balances.balance + NEW.amount,
          updated_at = now();
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_withdrawal_paid_credit_balance
AFTER UPDATE OF status ON public.withdrawal_requests
FOR EACH ROW
WHEN (NEW.status = 'paid')
EXECUTE FUNCTION public.credit_worker_balance();
