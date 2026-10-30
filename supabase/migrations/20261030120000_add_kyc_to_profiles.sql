-- Add kyc_completed column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_completed BOOLEAN DEFAULT FALSE;

-- Update existing profiles to have kyc_completed = false if null
UPDATE public.profiles SET kyc_completed = FALSE WHERE kyc_completed IS NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.kyc_completed IS 'Whether the user has completed KYC verification';
