-- Hourly contracts can only withdraw up to the earnings accrued so far
-- (hourly_rate * weekly_hours * full weeks since the contract started).

CREATE OR REPLACE FUNCTION public.enforce_withdrawal_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  contract_record public.contracts%ROWTYPE;
  already_requested NUMERIC;
  accrued NUMERIC;
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

    -- Hourly earnings accrue weekly (hourly_rate * weekly_hours) from the
    -- contract start date (or signing date) up to the contract end date.
    SELECT (
      contract_record.hourly_rate * contract_record.weekly_hours *
      GREATEST(
        0,
        (LEAST(COALESCE(contract_record.end_date::timestamptz, now()), now())
           - COALESCE(contract_record.start_date::timestamptz, contract_record.signed_at))
        / INTERVAL '7 days'
      )
    ) INTO accrued;

    IF NEW.amount > COALESCE(accrued, 0) THEN
      RAISE EXCEPTION 'Withdrawal exceeds accrued earnings';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
