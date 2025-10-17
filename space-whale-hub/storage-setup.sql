-- Storage Bucket Setup for Space Whale Hub
-- Run this in your Supabase SQL Editor

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('posts', 'posts', true),
  ('avatars', 'avatars', true),
  ('archive', 'archive', true);

-- Set up storage policies for posts bucket
CREATE POLICY "Users can upload their own posts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own posts" ON storage.objects
  FOR UPDATE USING (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own posts" ON storage.objects
  FOR DELETE USING (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view posts" ON storage.objects
  FOR SELECT USING (bucket_id = 'posts');

-- Set up storage policies for avatars bucket
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Set up storage policies for archive bucket
CREATE POLICY "Users can upload to archive" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'archive' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their archive items" ON storage.objects
  FOR UPDATE USING (bucket_id = 'archive' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their archive items" ON storage.objects
  FOR DELETE USING (bucket_id = 'archive' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view archive" ON storage.objects
  FOR SELECT USING (bucket_id = 'archive');
