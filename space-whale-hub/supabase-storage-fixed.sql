-- FIXED: Supabase Storage Setup with Correct RLS Policies
-- This script consolidates and fixes all storage issues

-- First, clean up any existing conflicting policies
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to access their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to posts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own posts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own posts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view posts" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to their journal" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own journal" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own journal" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own journal" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to archive" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own archive items" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own archive items" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view archive items" ON storage.objects;

-- Create storage buckets with proper configuration
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

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- FIXED: Universal RLS policies that work for all buckets
-- These policies use the correct data type conversion and folder structure

-- Policy 1: Allow authenticated users to upload files to their own folders
CREATE POLICY "Users can upload to their own folders"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Allow users to view files in their own folders
CREATE POLICY "Users can view their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Allow users to update files in their own folders
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Allow users to delete files in their own folders
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Additional policy: Allow public access to avatars and posts (for community viewing)
CREATE POLICY "Public can view avatars and posts"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id IN ('avatars', 'posts'));

-- Additional policy: Allow public access to archive items
CREATE POLICY "Public can view archive items"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'archive');

-- Verify the setup
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- Check bucket configuration
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id IN ('avatars', 'posts', 'journal', 'archive');
