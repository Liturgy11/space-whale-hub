-- Avatars bucket is public; object URLs work without a broad SELECT policy.
-- That policy only enables listing every avatar file. Run in SQL Editor.

DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- Keep bucket public for /object/public/avatars/... URLs
UPDATE storage.buckets
SET public = true
WHERE id = 'avatars';
