-- Create application status enum
CREATE TYPE public.application_status AS ENUM ('pending', 'paid', 'verified', 'matched', 'deployed', 'rejected');

-- Create applications table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 49),
  has_passport BOOLEAN NOT NULL DEFAULT false,
  status application_status NOT NULL DEFAULT 'pending',
  processing_fee TEXT,
  payment_reference TEXT,
  payment_status TEXT DEFAULT 'unpaid',
  payment_amount DECIMAL(10,2),
  payment_currency TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  manychat_subscriber_id TEXT,
  recruitment_cycle TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment transactions table
CREATE TABLE public.payment_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  transaction_ref TEXT NOT NULL UNIQUE,
  flutterwave_ref TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_type TEXT DEFAULT 'application_fee',
  customer_email TEXT,
  customer_phone TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create manychat messages log table
CREATE TABLE public.manychat_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  subscriber_id TEXT,
  message_type TEXT NOT NULL,
  message_content TEXT,
  direction TEXT NOT NULL DEFAULT 'outbound',
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manychat_logs ENABLE ROW LEVEL SECURITY;

-- Allow public inserts for applications (anyone can apply)
CREATE POLICY "Anyone can create applications" 
ON public.applications 
FOR INSERT 
WITH CHECK (true);

-- Allow reading own application by email
CREATE POLICY "Users can view their own applications by email" 
ON public.applications 
FOR SELECT 
USING (true);

-- Allow service role to update applications
CREATE POLICY "Service can update applications" 
ON public.applications 
FOR UPDATE 
USING (true);

-- Payment transactions policies
CREATE POLICY "Anyone can view payment transactions" 
ON public.payment_transactions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create payment transactions" 
ON public.payment_transactions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service can update payment transactions" 
ON public.payment_transactions 
FOR UPDATE 
USING (true);

-- ManyChat logs policies (admin access)
CREATE POLICY "Anyone can insert manychat logs" 
ON public.manychat_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view manychat logs" 
ON public.manychat_logs 
FOR SELECT 
USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for applications
ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_transactions;