-- Enable RLS on all public tables that need it
-- This fixes the "RLS Disabled in Public" errors

-- Enable RLS on main tables
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_items ENABLE ROW LEVEL SECURITY;

-- Enable RLS on storage.objects (for file uploads)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for journal entries
CREATE POLICY "Users can view their own journal entries"
ON public.journal_entries
FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own journal entries"
ON public.journal_entries
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own journal entries"
ON public.journal_entries
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own journal entries"
ON public.journal_entries
FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- Create basic RLS policies for posts
CREATE POLICY "Users can view all posts"
ON public.posts
FOR SELECT
TO authenticated;

CREATE POLICY "Users can insert their own posts"
ON public.posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own posts"
ON public.posts
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.posts
FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- Create basic RLS policies for comments
CREATE POLICY "Users can view all comments"
ON public.comments
FOR SELECT
TO authenticated;

CREATE POLICY "Users can insert their own comments"
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own comments"
ON public.comments
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.comments
FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- Create basic RLS policies for likes
CREATE POLICY "Users can view all likes"
ON public.likes
FOR SELECT
TO authenticated;

CREATE POLICY "Users can insert their own likes"
ON public.likes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own likes"
ON public.likes
FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- Create basic RLS policies for archive items
CREATE POLICY "Users can view all archive items"
ON public.archive_items
FOR SELECT
TO authenticated;

CREATE POLICY "Users can insert their own archive items"
ON public.archive_items
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own archive items"
ON public.archive_items
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own archive items"
ON public.archive_items
FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- Create storage policies for file uploads
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to access their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (auth.uid()::text = (storage.foldername(name))[1]);
