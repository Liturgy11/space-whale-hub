-- Archive Storage Fix - Ensure Archive Bucket is Public and Accessible
-- This script ensures the archive bucket has proper public access permissions

-- Step 1: Ensure the 'archive' bucket exists and is public
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'archive') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
    VALUES ('archive', 'archive', TRUE, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'application/pdf']);
  ELSE
    UPDATE storage.buckets SET public = TRUE WHERE id = 'archive';
  END IF;
END $$;

-- Step 2: Drop existing policies for 'archive' bucket to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow individual read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to archive" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own archive items" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own archive items" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view archive items" ON storage.objects;
DROP POLICY IF EXISTS "Publicly accessible archive files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload archive files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update archive files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete archive files" ON storage.objects;

-- Step 3: Create comprehensive policies for 'archive' bucket

-- Policy for public read access to 'archive' bucket
CREATE POLICY "Publicly accessible archive files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'archive');

-- Policy for authenticated users to insert into 'archive' bucket
CREATE POLICY "Authenticated users can upload archive files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'archive' AND auth.uid()::text = owner_id);

-- Policy for authenticated users to update their own archive files
CREATE POLICY "Authenticated users can update archive files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'archive' AND auth.uid()::text = owner_id)
WITH CHECK (bucket_id = 'archive' AND auth.uid()::text = owner_id);

-- Policy for authenticated users to delete their own archive files
CREATE POLICY "Authenticated users can delete archive files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'archive' AND auth.uid()::text = owner_id);

-- Policy for authenticated users to read their own archive files (redundant with public, but good for consistency)
CREATE POLICY "Authenticated users can read archive files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'archive' AND auth.uid()::text = owner_id);

-- Step 4: Verify the setup
SELECT 
  'Archive Bucket Status' as status,
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types 
FROM storage.buckets 
WHERE id = 'archive';

-- Step 5: Check existing policies for archive bucket
SELECT 
  'Archive Policies' as status,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%archive%'
ORDER BY policyname;
