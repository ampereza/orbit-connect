-- ============================================================
-- Connects balance: charge the flat 10 Connects application fee
-- when an application is submitted. Settle final payouts when a
-- contract reaches a terminal lifecycle stage.
-- ============================================================

-- Charge the flat Connects application fee on submission.
CREATE OR REPLACE FUNCTION public.charge_connects_application_fee()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO public.worker_balances (user_id, balance, currency)
    VALUES (NEW.user_id, -10, 'Connects')
    ON CONFLICT (user_id) DO UPDATE
      SET balance = public.worker_balances.balance - 10,
          updated_at = now();
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_application_submitted_charge_connects
AFTER INSERT ON public.applications
FOR EACH ROW
WHEN (NEW.user_id IS NOT NULL)
EXECUTE FUNCTION public.charge_connects_application_fee();

-- Notify the worker when the employer starts the contract (signed -> active).
CREATE OR REPLACE FUNCTION public.notify_contract_started()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'active' AND OLD.status <> 'active' THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.worker_id,
      'Contract started',
      'The employer has started the contract "' || NEW.title || '".',
      'info'
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_contract_started
AFTER UPDATE OF status ON public.contracts
FOR EACH ROW
WHEN (NEW.status = 'active')
EXECUTE FUNCTION public.notify_contract_started();

-- Settle the final payout when a contract is completed.
CREATE OR REPLACE FUNCTION public.settle_contract_payout()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  remaining NUMERIC;
  final_amount NUMERIC;
BEGIN
  IF NEW.status = 'completed' AND OLD.status <> 'completed' THEN
    IF NEW.pay_type = 'fixed' AND NEW.fixed_amount IS NOT NULL THEN
      SELECT COALESCE(SUM(w.amount), 0) INTO remaining
      FROM public.withdrawal_requests w
      WHERE w.contract_id = NEW.id AND w.status <> 'rejected';

      final_amount := GREATEST(NEW.fixed_amount - COALESCE(remaining, 0), 0);
    ELSIF NEW.pay_type = 'hourly' THEN
      SELECT (
        NEW.hourly_rate * NEW.weekly_hours *
        GREATEST(
          0,
          (LEAST(COALESCE(NEW.end_date::timestamptz, now()), now())
             - COALESCE(NEW.start_date::timestamptz, NEW.signed_at))
          / INTERVAL '7 days'
        )
      ) INTO final_amount;
      final_amount := COALESCE(final_amount, 0);
    END IF;

    IF final_amount > 0 THEN
      INSERT INTO public.worker_balances (user_id, balance, currency)
      VALUES (NEW.worker_id, final_amount, NEW.currency)
      ON CONFLICT (user_id) DO UPDATE
        SET balance = public.worker_balances.balance + final_amount,
            updated_at = now();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_contract_completed_settle_payout
AFTER UPDATE OF status ON public.contracts
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION public.settle_contract_payout();
