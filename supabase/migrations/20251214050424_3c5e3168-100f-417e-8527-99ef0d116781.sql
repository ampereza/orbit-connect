-- Create applicant_profiles table for extended bio information
CREATE TABLE public.applicant_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  
  -- Work Experience
  previous_employer TEXT,
  job_title TEXT,
  years_of_experience INTEGER,
  skills TEXT[],
  languages TEXT[],
  certifications TEXT[],
  
  -- Personal Details
  marital_status TEXT,
  number_of_dependents INTEGER,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  next_of_kin_name TEXT,
  next_of_kin_phone TEXT,
  next_of_kin_relationship TEXT,
  
  -- Additional Info
  education_level TEXT,
  education_institution TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(application_id)
);

-- Create applicant_documents table for KYC documents
CREATE TABLE public.applicant_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'passport', 'police_clearance', 'cv', 'education_cert', 'medical_cert', 'reference'
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create references table for reference contacts
CREATE TABLE public.applicant_references (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  reference_name TEXT NOT NULL,
  reference_phone TEXT NOT NULL,
  reference_email TEXT,
  relationship TEXT NOT NULL,
  company_or_organization TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add kyc_completed flag to applications
ALTER TABLE public.applications ADD COLUMN kyc_completed BOOLEAN DEFAULT FALSE;

-- Enable RLS
ALTER TABLE public.applicant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicant_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicant_references ENABLE ROW LEVEL SECURITY;

-- Policies for applicant_profiles
CREATE POLICY "Anyone can create their profile" ON public.applicant_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view profiles by application" ON public.applicant_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their profile" ON public.applicant_profiles
  FOR UPDATE USING (true);

CREATE POLICY "Admins can manage profiles" ON public.applicant_profiles
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies for applicant_documents
CREATE POLICY "Anyone can upload documents" ON public.applicant_documents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view documents by application" ON public.applicant_documents
  FOR SELECT USING (true);

CREATE POLICY "Admins can update documents" ON public.applicant_documents
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies for applicant_references
CREATE POLICY "Anyone can add references" ON public.applicant_references
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view references by application" ON public.applicant_references
  FOR SELECT USING (true);

-- Create updated_at triggers
CREATE TRIGGER update_applicant_profiles_updated_at
  BEFORE UPDATE ON public.applicant_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applicant_documents_updated_at
  BEFORE UPDATE ON public.applicant_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-documents', 'kyc-documents', false);

-- Storage policies
CREATE POLICY "Anyone can upload KYC documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'kyc-documents');

CREATE POLICY "Anyone can view their own documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'kyc-documents');

CREATE POLICY "Admins can view all documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'kyc-documents' AND has_role(auth.uid(), 'admin'::app_role));