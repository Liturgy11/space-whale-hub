-- Verify Archive Tables Exist and Are Accessible
-- This script checks if the archive tables exist and can be queried

-- Check if tables exist in information_schema
SELECT 
  'Tables in Schema' as status,
  table_name,
  table_schema,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('archive_items', 'archive_likes', 'archive_comments')
ORDER BY table_name;

-- Try to query each table to see if they're accessible
SELECT 
  'Archive Items Count' as status,
  COUNT(*) as count
FROM public.archive_items;

SELECT 
  'Archive Likes Count' as status,
  COUNT(*) as count
FROM public.archive_likes;

SELECT 
  'Archive Comments Count' as status,
  COUNT(*) as count
FROM public.archive_comments;

-- Check table structure
SELECT 
  'Archive Items Structure' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'archive_items'
ORDER BY ordinal_position;

SELECT 
  'Archive Likes Structure' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'archive_likes'
ORDER BY ordinal_position;

SELECT 
  'Archive Comments Structure' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'archive_comments'
ORDER BY ordinal_position;
