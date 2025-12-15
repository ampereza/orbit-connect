-- Create insurance subscriptions table
CREATE TABLE public.insurance_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id),
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 35,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_reference TEXT,
  flutterwave_ref TEXT,
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_client BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.insurance_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can create insurance subscriptions"
ON public.insurance_subscriptions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view insurance subscriptions"
ON public.insurance_subscriptions
FOR SELECT
USING (true);

CREATE POLICY "Service can update insurance subscriptions"
ON public.insurance_subscriptions
FOR UPDATE
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_insurance_subscriptions_updated_at
BEFORE UPDATE ON public.insurance_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();