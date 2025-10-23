-- SIMPLE FIX: Supabase Storage Setup (No direct table modifications)
-- This approach works with standard Supabase permissions

-- Step 1: Create storage buckets (this should work with your permissions)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']),
  ('posts', 'posts', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'video/mp4', 'video/webm']),
  ('journal', 'journal', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']),
  ('archive', 'archive', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Step 2: Check if buckets were created successfully
SELECT 
  'Buckets Created' as status,
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types 
FROM storage.buckets 
WHERE id IN ('avatars', 'posts', 'journal', 'archive')
ORDER BY id;
