-- Run once in Supabase SQL Editor: multi-image posts for Community Orbit.
-- Safe to re-run.

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS media_urls text[] DEFAULT NULL;

COMMENT ON COLUMN public.posts.media_urls IS
  'Ordered image URLs for gallery/carousel posts. media_url remains the primary (first) URL.';

-- Backfill existing single-image posts
UPDATE public.posts
SET media_urls = ARRAY[media_url]
WHERE media_url IS NOT NULL
  AND (media_urls IS NULL OR cardinality(media_urls) = 0);
