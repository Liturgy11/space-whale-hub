-- Make content column nullable to support encrypted entries
-- When content is encrypted, we don't store plain text in the content column
-- This allows us to have entries with only encrypted content (no plain text)

ALTER TABLE public.journal_entries 
ALTER COLUMN content DROP NOT NULL;

