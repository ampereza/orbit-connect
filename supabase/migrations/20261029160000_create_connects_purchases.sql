-- Connects purchases: workers buy Connects (USD 13 - 100) through the
-- Flutterwave payment gateway. Purchases are refundable only when the worker
-- has not been hired within 45 days of the initial purchase.

CREATE TABLE IF NOT EXISTS public.connects_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_usd NUMERIC(10, 2) NOT NULL CHECK (amount_usd >= 13 AND amount_usd <= 100),
  connects NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded')),
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  refunded_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_connects_purchases_user_id
  ON public.connects_purchases(user_id);

CREATE INDEX IF NOT EXISTS idx_connects_purchases_status
  ON public.connects_purchases(status);

ALTER TABLE public.connects_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view their own connects purchases"
  ON public.connects_purchases
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Workers can create their own connects purchases"
  ON public.connects_purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage connects purchases"
  ON public.connects_purchases
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Refund a Connects purchase when the buyer has not been hired within 45 days
-- of the initial purchase. Purchases tied to a hire (contract) are final.
CREATE OR REPLACE FUNCTION public.refund_connects_purchase(purchase_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  purchase public.connects_purchases%ROWTYPE;
BEGIN
  SELECT * INTO purchase
  FROM public.connects_purchases
  WHERE id = purchase_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF purchase.status <> 'completed' THEN
    RETURN false;
  END IF;

  -- Once hired (contract assigned), the purchase is not refundable.
  IF purchase.contract_id IS NOT NULL THEN
    RETURN false;
  END IF;

  IF purchase.created_at + INTERVAL '45 days' < now() THEN
    RETURN false;
  END IF;

  UPDATE public.connects_purchases
  SET status = 'refunded',
      refunded_at = now()
  WHERE id = purchase_id;

  INSERT INTO public.worker_balances (user_id, balance, currency)
  VALUES (purchase.user_id, purchase.connects, 'Connects')
  ON CONFLICT (user_id) DO UPDATE
    SET balance = public.worker_balances.balance + purchase.connects,
        updated_at = now();

  RETURN true;
END;
$$;
