-- Add media columns to journal_entries table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.journal_entries 
ADD COLUMN media_url TEXT,
ADD COLUMN media_type TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.journal_entries.media_url IS 'URL to uploaded media file';
COMMENT ON COLUMN public.journal_entries.media_type IS 'Type of media: image, video, audio, document';
