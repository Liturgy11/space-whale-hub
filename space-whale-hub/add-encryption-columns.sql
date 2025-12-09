-- Add encryption salt and IV columns for client-side encryption
-- These are needed to decrypt content encrypted with AES-GCM

ALTER TABLE public.journal_entries 
ADD COLUMN IF NOT EXISTS encryption_salt TEXT,
ADD COLUMN IF NOT EXISTS encryption_iv TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.journal_entries.encryption_salt IS 'Base64-encoded salt used for key derivation (PBKDF2)';
COMMENT ON COLUMN public.journal_entries.encryption_iv IS 'Base64-encoded initialization vector (IV) for AES-GCM encryption';

