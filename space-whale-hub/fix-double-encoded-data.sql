-- Fix for potentially double-encoded encrypted data
-- If data was already base64 when stored in BYTEA, the migration might have encoded it again
-- This script checks and fixes double-encoded data

-- Step 1: Check if we have any encrypted entries
DO $$
DECLARE
  encrypted_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO encrypted_count
  FROM public.journal_entries
  WHERE is_encrypted = true AND content_encrypted IS NOT NULL;
  
  RAISE NOTICE 'Found % encrypted entries', encrypted_count;
END $$;

-- Step 2: Try to detect and fix double-encoded data
-- Base64 strings that are double-encoded will be much longer than expected
-- A typical encrypted entry might be 100-500 characters when base64 encoded once
-- If it's 2000+ characters, it might be double-encoded

-- Check the length distribution
SELECT 
  id,
  LENGTH(content_encrypted) as encrypted_length,
  LENGTH(encryption_salt) as salt_length,
  LENGTH(encryption_iv) as iv_length,
  created_at
FROM public.journal_entries
WHERE is_encrypted = true 
  AND content_encrypted IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- Note: If the encrypted_length is unusually long (2000+), the data might be double-encoded
-- In that case, we would need to decode it once to fix it
-- However, we can't automatically fix this without potentially breaking correctly encoded data
-- So we'll need to check manually first

