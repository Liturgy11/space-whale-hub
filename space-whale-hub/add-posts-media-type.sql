-- Add media_type column to posts table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.posts 
ADD COLUMN media_type TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.posts.media_type IS 'Type of media: image, video, audio, document';
