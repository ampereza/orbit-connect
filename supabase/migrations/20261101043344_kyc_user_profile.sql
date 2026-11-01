-- Link KYC tables to user profile instead of application
ALTER TABLE applicant_profiles
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE applicant_documents
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Make application_id optional
ALTER TABLE applicant_profiles ALTER COLUMN application_id DROP NOT NULL;
ALTER TABLE applicant_documents ALTER COLUMN application_id DROP NOT NULL;

-- Backfill user_id from applications where possible
UPDATE applicant_profiles ap
SET user_id = a.user_id
FROM applications a
WHERE ap.application_id = a.id AND ap.user_id IS NULL;

UPDATE applicant_documents ad
SET user_id = a.user_id
FROM applications a
WHERE ad.application_id = a.id AND ad.user_id IS NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_applicant_profiles_user_id ON applicant_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_applicant_documents_user_id ON applicant_documents(user_id);
