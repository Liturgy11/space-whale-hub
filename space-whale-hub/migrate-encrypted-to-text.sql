-- Migration: Change content_encrypted from BYTEA to TEXT
-- This allows storing base64-encoded strings directly, which is simpler
-- and avoids hex conversion issues when retrieving from the database

-- Step 1: Check current column type
DO $$
DECLARE
  current_type TEXT;
BEGIN
  -- Get the current data type
  SELECT data_type INTO current_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'journal_entries'
    AND column_name = 'content_encrypted';
  
  -- If it's already TEXT, we're done
  IF current_type = 'text' THEN
    RAISE NOTICE 'Column is already TEXT, no migration needed';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Current type is: %', current_type;
END $$;

-- Step 2: Change the column type from BYTEA to TEXT directly
-- The USING clause will handle the conversion automatically
ALTER TABLE public.journal_entries 
  ALTER COLUMN content_encrypted TYPE TEXT 
  USING CASE 
    WHEN content_encrypted IS NULL THEN NULL::text
    -- If it's BYTEA, encode to base64
    ELSE encode(content_encrypted::bytea, 'base64')
  END;

-- Step 3: Add a comment to document the column format
COMMENT ON COLUMN public.journal_entries.content_encrypted IS 'Base64-encoded encrypted content. Stored as TEXT for easier handling.';

-- Verify the change
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'journal_entries' 
    AND column_name = 'content_encrypted'
    AND data_type = 'text'
  ) THEN
    RAISE NOTICE '✅ Successfully migrated content_encrypted to TEXT';
  ELSE
    RAISE EXCEPTION '❌ Migration failed: content_encrypted is not TEXT';
  END IF;
END $$;

