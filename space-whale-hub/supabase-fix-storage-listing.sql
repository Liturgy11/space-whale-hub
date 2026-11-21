-- Stop Storage listing of all files in public buckets + make journal private again.
-- Public object URLs for posts/archive keep working (bucket.public = true).
-- Journal media must be loaded via signed URLs after this (app updated).
-- Run in Supabase SQL Editor. Safe to re-run.

-- ---------------------------------------------------------------------------
-- Journal: private bucket (Inner Space)
-- ---------------------------------------------------------------------------
UPDATE storage.buckets
SET public = false
WHERE id = 'journal';

-- Advisor-named listing policies (and common aliases)
DROP POLICY IF EXISTS "Public can view journal images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view journal images" ON storage.objects;

-- Owner can still read own objects via Storage API (signed upload / list own folder)
DROP POLICY IF EXISTS "Users can view their own journal" ON storage.objects;
CREATE POLICY "Users can view their own journal"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'journal'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ---------------------------------------------------------------------------
-- Posts / archive: keep public buckets, remove listing SELECT policies
-- (public URL /object/public/... does not need these policies)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view post media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view posts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read archive files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view archive media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view archive items" ON storage.objects;

-- If a combined public-read policy exists, replace with avatars-only so journal
-- is not publicly listable/readable via that catch-all.
DROP POLICY IF EXISTS "Allow public access to community content" ON storage.objects;
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Ensure posts + archive stay public for direct URL access
UPDATE storage.buckets
SET public = true
WHERE id IN ('posts', 'archive');
