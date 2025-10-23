-- Safe Archive Tables Creation - Handles Existing Policies
-- This script creates the necessary tables for archive functionality without conflicts

-- Create archive_likes table
CREATE TABLE IF NOT EXISTS public.archive_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES public.archive_items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(item_id, user_id)
);

-- Create archive_comments table
CREATE TABLE IF NOT EXISTS public.archive_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES public.archive_items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on both tables (safe to run multiple times)
ALTER TABLE public.archive_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view archive likes" ON public.archive_likes;
DROP POLICY IF EXISTS "Authenticated users can like archive items" ON public.archive_likes;
DROP POLICY IF EXISTS "Users can unlike their own likes" ON public.archive_likes;
DROP POLICY IF EXISTS "Anyone can view archive comments" ON public.archive_comments;
DROP POLICY IF EXISTS "Authenticated users can comment on archive items" ON public.archive_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.archive_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.archive_comments;

-- Create RLS policies for archive_likes
CREATE POLICY "Anyone can view archive likes"
ON public.archive_likes FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can like archive items"
ON public.archive_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
ON public.archive_likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create RLS policies for archive_comments
CREATE POLICY "Anyone can view archive comments"
ON public.archive_comments FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can comment on archive items"
ON public.archive_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.archive_comments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.archive_comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes for better performance (safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_archive_likes_item_id ON public.archive_likes(item_id);
CREATE INDEX IF NOT EXISTS idx_archive_likes_user_id ON public.archive_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_archive_comments_item_id ON public.archive_comments(item_id);
CREATE INDEX IF NOT EXISTS idx_archive_comments_user_id ON public.archive_comments(user_id);

-- Verify tables were created
SELECT 
  'Archive Tables Status' as status,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('archive_likes', 'archive_comments')
ORDER BY table_name;

-- Show existing policies
SELECT 
  'Archive Policies' as status,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('archive_likes', 'archive_comments')
ORDER BY tablename, policyname;
