-- Fix journal bucket to be public for media display
-- This allows journal images to be displayed in the browser

-- Update the journal bucket to be public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'journal';

-- Add a policy to allow public read access to journal images
CREATE POLICY "Public can view journal images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'journal');

-- Verify the bucket configuration
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'journal';
