-- Fix file size limits for existing storage buckets
-- This script is safe to run multiple times

-- Update file size limits (only if buckets exist)
UPDATE storage.buckets 
SET file_size_limit = 5242880  -- 5MB for avatars
WHERE id = 'avatars' AND EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars');

UPDATE storage.buckets 
SET file_size_limit = 10485760  -- 10MB for posts
WHERE id = 'posts' AND EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'posts');

UPDATE storage.buckets 
SET file_size_limit = 10485760  -- 10MB for journal
WHERE id = 'journal' AND EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'journal');

UPDATE storage.buckets 
SET file_size_limit = 20971520  -- 20MB for archive
WHERE id = 'archive' AND EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'archive');

-- Update allowed MIME types to include HEIC
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
WHERE id = 'avatars' AND EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars');

UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'video/mp4', 'video/webm']
WHERE id = 'posts' AND EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'posts');

UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
WHERE id = 'journal' AND EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'journal');

UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'application/pdf']
WHERE id = 'archive' AND EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'archive');





