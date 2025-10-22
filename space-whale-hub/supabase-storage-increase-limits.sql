-- Set conservative file size limits for free Supabase plan (50MB total)
-- This allows reasonable file sizes while staying within the 50MB limit

UPDATE storage.buckets 
SET file_size_limit = 5242880  -- 5MB for avatars
WHERE id = 'avatars';

UPDATE storage.buckets 
SET file_size_limit = 10485760  -- 10MB for posts
WHERE id = 'posts';

UPDATE storage.buckets 
SET file_size_limit = 10485760  -- 10MB for journal
WHERE id = 'journal';

UPDATE storage.buckets 
SET file_size_limit = 20971520  -- 20MB for archive
WHERE id = 'archive';

-- Also update allowed MIME types to include HEIC
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
WHERE id = 'avatars';

UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'video/mp4', 'video/webm']
WHERE id = 'posts';

UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
WHERE id = 'journal';

UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'application/pdf']
WHERE id = 'archive';
