-- Fix Supabase storage permissions for lightbox access
-- This ensures journal images are publicly accessible for lightbox viewing

-- 1. Ensure the journal bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'journal';

-- 2. Drop any existing policies that might be blocking access
DROP POLICY IF EXISTS "Public read access for journal bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public can view journal entries" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own journal" ON storage.objects;

-- 3. Create a comprehensive public read policy for journal bucket
CREATE POLICY "Public read access for journal bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'journal');

-- 4. Ensure authenticated users can still manage their files
CREATE POLICY "Users can upload to their journal"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'journal'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own journal files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'journal'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own journal files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'journal'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Verify the setup
SELECT 
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'journal';

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%journal%'
ORDER BY policyname;
