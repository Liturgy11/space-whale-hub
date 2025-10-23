-- Fix RLS policies for journal_entries table
-- This should resolve the "new row violates row-level security policy" error

-- First, check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'journal_entries' AND schemaname = 'public';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can insert their own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update their own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can delete their own journal entries" ON public.journal_entries;

-- Enable RLS
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper UUID handling
CREATE POLICY "Users can view their own journal entries"
ON public.journal_entries
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries"
ON public.journal_entries
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
ON public.journal_entries
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
ON public.journal_entries
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'journal_entries' AND schemaname = 'public'
ORDER BY policyname;
