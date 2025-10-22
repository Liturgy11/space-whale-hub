-- Clean up existing storage policies and buckets
-- Run this FIRST if you get "already exists" errors

-- Drop all existing policies
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

-- First, delete all objects from the buckets
DELETE FROM storage.objects WHERE bucket_id = 'avatars';
DELETE FROM storage.objects WHERE bucket_id = 'posts';
DELETE FROM storage.objects WHERE bucket_id = 'journal';
DELETE FROM storage.objects WHERE bucket_id = 'archive';

-- Then delete the buckets
DELETE FROM storage.buckets WHERE id = 'avatars';
DELETE FROM storage.buckets WHERE id = 'posts';
DELETE FROM storage.buckets WHERE id = 'journal';
DELETE FROM storage.buckets WHERE id = 'archive';
