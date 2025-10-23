-- Simple Archive Storage Fix - Just Fix the Archive Bucket
-- This script only fixes archive-specific issues without touching existing policies

-- Step 1: Ensure the 'archive' bucket exists and is public
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'archive') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
    VALUES ('archive', 'archive', TRUE, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'application/pdf']);
  ELSE
    UPDATE storage.buckets SET public = TRUE WHERE id = 'archive';
  END IF;
END $$;

-- Step 2: Drop only archive-specific policies that might conflict
DROP POLICY IF EXISTS "Anyone can read archive files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload archive files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update archive files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete archive files" ON storage.objects;

-- Step 3: Create only the essential archive policies

-- Most important: Public read access for archive files
CREATE POLICY "Anyone can read archive files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'archive');

-- Allow archive uploads with 'archive-uploads' owner
CREATE POLICY "Anyone can upload archive files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'archive' AND (auth.uid()::text = owner_id OR owner_id = 'archive-uploads'));

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

-- Step 5: Check what files exist in archive bucket
SELECT 
  'Archive Files' as status,
  name,
  bucket_id,
  owner_id,
  created_at
FROM storage.objects 
WHERE bucket_id = 'archive'
ORDER BY created_at DESC
LIMIT 10;