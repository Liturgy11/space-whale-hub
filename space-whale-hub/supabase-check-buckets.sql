-- Check what storage buckets currently exist
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
ORDER BY id;
