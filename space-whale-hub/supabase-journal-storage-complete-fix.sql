-- Complete fix for journal storage access
-- This ensures journal images can be displayed publicly

-- 1. Make sure the journal bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'journal';

-- 2. Remove any existing conflicting policies
DROP POLICY IF EXISTS "Users can view their own journal" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to their journal" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own journal" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own journal" ON storage.objects;
DROP POLICY IF EXISTS "Public can view journal images" ON storage.objects;

-- 3. Create policies that allow public read access to journal images
CREATE POLICY "Public can view journal images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'journal');

-- 4. Allow authenticated users to upload to journal bucket
CREATE POLICY "Authenticated users can upload to journal"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'journal');

-- 5. Allow users to update their own journal files
CREATE POLICY "Users can update their own journal files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'journal' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. Allow users to delete their own journal files
CREATE POLICY "Users can delete their own journal files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'journal' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 7. Verify the setup
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
AND policyname LIKE '%journal%'
ORDER BY policyname;

-- 8. Check bucket configuration
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'journal';
