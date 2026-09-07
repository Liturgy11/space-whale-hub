-- Video upload support for archive albums + Community Orbit posts
-- Run in Supabase SQL Editor after deploying the signed-upload changes.
-- Raises size limits and allows iPhone MOV (video/quicktime).

UPDATE storage.buckets
SET file_size_limit = 104857600  -- 100MB
WHERE id = 'archive';

UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'audio/x-m4a',
  'application/pdf'
]
WHERE id = 'archive';

UPDATE storage.buckets
SET file_size_limit = 104857600  -- 100MB (Orbit videos use signed direct upload)
WHERE id = 'posts';

UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
  'video/mp4',
  'video/webm',
  'video/quicktime'
]
WHERE id = 'posts';
