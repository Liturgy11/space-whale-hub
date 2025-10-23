-- COMPLETE FIX: Supabase Storage Setup
-- This script fixes all storage issues and sets up proper RLS policies

-- Step 1: Clean up ALL existing policies to avoid conflicts
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

-- Step 2: Create/Update storage buckets with proper configuration
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

-- Step 3: Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 4: Create SIMPLIFIED RLS policies that actually work
-- These policies are designed to work with the service role approach

-- Policy 1: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Policy 2: Allow users to view files in their own folders
CREATE POLICY "Allow users to view their files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Allow users to update their own files
CREATE POLICY "Allow users to update their files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Allow users to delete their own files
CREATE POLICY "Allow users to delete their files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 5: Allow public access to avatars, posts, and archive
CREATE POLICY "Allow public access to community content"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id IN ('avatars', 'posts', 'archive'));

-- Step 5: Verify the setup
SELECT 
  'Policies Created' as status,
  COUNT(*) as count
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Step 6: Check bucket configuration
SELECT 
  'Buckets Configured' as status,
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types 
FROM storage.buckets 
WHERE id IN ('avatars', 'posts', 'journal', 'archive')
ORDER BY id;

-- Step 7: Test query to verify RLS is working
SELECT 
  'RLS Status' as status,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';
