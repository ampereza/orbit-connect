-- Store the cover letter submitted with an application
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS cover_letter TEXT;
