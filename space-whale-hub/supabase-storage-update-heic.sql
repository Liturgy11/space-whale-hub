-- Update storage buckets to allow HEIC files
-- Run this to add HEIC support

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

