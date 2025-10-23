-- Final Archive Storage Fix - Ensure Complete Public Access
-- This script ensures archive bucket has full public read access

-- Step 1: Make sure archive bucket is public
UPDATE storage.buckets 
SET public = TRUE 
WHERE id = 'archive';

-- Step 2: Drop ALL existing policies for archive bucket
DROP POLICY IF EXISTS "Publicly accessible archive files" ON storage.objects;
DROP POLICY IF EXISTS "Archive uploads can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Archive uploads can update files" ON storage.objects;
DROP POLICY IF EXISTS "Archive uploads can delete files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload archive files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update archive files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete archive files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read archive files" ON storage.objects;

-- Step 3: Create the most permissive policies for archive bucket

-- Allow anyone to read archive files (most important!)
CREATE POLICY "Anyone can read archive files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'archive');

-- Allow authenticated users to upload to archive
CREATE POLICY "Anyone can upload archive files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'archive' AND (auth.uid()::text = owner_id OR owner_id = 'archive-uploads'));

-- Allow authenticated users to update archive files
CREATE POLICY "Anyone can update archive files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'archive' AND (auth.uid()::text = owner_id OR owner_id = 'archive-uploads'))
WITH CHECK (bucket_id = 'archive' AND (auth.uid()::text = owner_id OR owner_id = 'archive-uploads'));

-- Allow authenticated users to delete archive files
CREATE POLICY "Anyone can delete archive files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'archive' AND (auth.uid()::text = owner_id OR owner_id = 'archive-uploads'));

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

-- Step 5: List all files in archive bucket
SELECT 
  'Archive Files' as status,
  name,
  bucket_id,
  owner_id,
  created_at
FROM storage.objects 
WHERE bucket_id = 'archive'
ORDER BY created_at DESC;

-- Step 6: Test public access to a specific file
SELECT 
  'Public URL Test' as status,
  name,
  bucket_id,
  CASE 
    WHEN bucket_id = 'archive' THEN 'https://qrmdgbzmdtvqcuzfkwar.supabase.co/storage/v1/object/public/archive/' || name
    ELSE 'Not archive bucket'
  END as public_url
FROM storage.objects 
WHERE bucket_id = 'archive' 
  AND name LIKE '%.jpeg'
LIMIT 3;
