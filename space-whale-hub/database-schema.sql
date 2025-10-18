-- Space Whale Hub Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. EXTENDED USER PROFILES
-- ============================================

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  pronouns TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can read public profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (is_public = true);

-- Users can read their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. JOURNAL ENTRIES (Personal Space)
-- ============================================

CREATE TABLE public.journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT, -- e.g., "happy", "sad", "calm", "anxious"
  tags TEXT[], -- array of tags
  media_url TEXT, -- URL to uploaded media file
  media_type TEXT, -- Type of media: image, video, audio, document
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Only user can see their own entries
CREATE POLICY "Users can view own journal entries"
  ON public.journal_entries FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own entries
CREATE POLICY "Users can create own journal entries"
  ON public.journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own entries
CREATE POLICY "Users can update own journal entries"
  ON public.journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own entries
CREATE POLICY "Users can delete own journal entries"
  ON public.journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX journal_entries_user_id_idx ON public.journal_entries(user_id);
CREATE INDEX journal_entries_created_at_idx ON public.journal_entries(created_at DESC);

-- ============================================
-- 3. COMMUNITY POSTS
-- ============================================

CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT, -- URL to uploaded image/video
  tags TEXT[],
  has_content_warning BOOLEAN DEFAULT false,
  content_warning_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Everyone can view public posts
CREATE POLICY "Posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING (true);

-- Users can create posts
CREATE POLICY "Authenticated users can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX posts_user_id_idx ON public.posts(user_id);
CREATE INDEX posts_created_at_idx ON public.posts(created_at DESC);

-- ============================================
-- 4. COMMENTS
-- ============================================

CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Everyone can view comments
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (true);

-- Users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX comments_post_id_idx ON public.comments(post_id);
CREATE INDEX comments_user_id_idx ON public.comments(user_id);

-- ============================================
-- 5. LIKES
-- ============================================

CREATE TABLE public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id) -- Can only like once
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Everyone can view likes
CREATE POLICY "Likes are viewable by everyone"
  ON public.likes FOR SELECT
  USING (true);

-- Users can like posts
CREATE POLICY "Authenticated users can like posts"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can unlike posts
CREATE POLICY "Users can remove own likes"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX likes_post_id_idx ON public.likes(post_id);
CREATE INDEX likes_user_id_idx ON public.likes(user_id);

-- ============================================
-- 6. ARCHIVE ITEMS
-- ============================================

CREATE TABLE public.archive_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL, -- 'video', 'artwork', 'zine', 'audio'
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  artist_name TEXT,
  tags TEXT[],
  is_approved BOOLEAN DEFAULT false, -- for moderation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.archive_items ENABLE ROW LEVEL SECURITY;

-- Everyone can view approved items
CREATE POLICY "Approved archive items are viewable by everyone"
  ON public.archive_items FOR SELECT
  USING (is_approved = true);

-- Users can view their own items (even unapproved)
CREATE POLICY "Users can view own archive items"
  ON public.archive_items FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create archive items
CREATE POLICY "Authenticated users can create archive items"
  ON public.archive_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own items
CREATE POLICY "Users can update own archive items"
  ON public.archive_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX archive_items_user_id_idx ON public.archive_items(user_id);
CREATE INDEX archive_items_content_type_idx ON public.archive_items(content_type);

-- ============================================
-- 7. WORKSHOPS
-- ============================================

CREATE TABLE public.workshops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration_minutes INTEGER,
  capacity INTEGER,
  price DECIMAL(10,2) DEFAULT 0,
  is_ndis_eligible BOOLEAN DEFAULT false,
  registration_open BOOLEAN DEFAULT true,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;

-- Everyone can view workshops
CREATE POLICY "Workshops are viewable by everyone"
  ON public.workshops FOR SELECT
  USING (true);

-- Only admins can create/update workshops (we'll add admin role later)
CREATE POLICY "Admins can manage workshops"
  ON public.workshops FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 8. WORKSHOP REGISTRATIONS
-- ============================================

CREATE TABLE public.workshop_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  accessibility_needs TEXT,
  is_ndis_participant BOOLEAN DEFAULT false,
  ndis_number TEXT,
  dietary_requirements TEXT,
  status TEXT DEFAULT 'registered', -- 'registered', 'cancelled', 'attended'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workshop_id, user_id) -- Can only register once per workshop
);

ALTER TABLE public.workshop_registrations ENABLE ROW LEVEL SECURITY;

-- Users can view their own registrations
CREATE POLICY "Users can view own registrations"
  ON public.workshop_registrations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create registrations
CREATE POLICY "Users can register for workshops"
  ON public.workshop_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own registrations
CREATE POLICY "Users can update own registrations"
  ON public.workshop_registrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX registrations_workshop_id_idx ON public.workshop_registrations(workshop_id);
CREATE INDEX registrations_user_id_idx ON public.workshop_registrations(user_id);

-- ============================================
-- 9. CONTENT REPORTS (Moderation)
-- ============================================

CREATE TABLE public.content_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL, -- 'post', 'comment', 'archive_item'
  content_id UUID NOT NULL,
  reason TEXT NOT NULL,
  additional_context TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'actioned', 'dismissed'
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

-- Users can submit reports
CREATE POLICY "Authenticated users can submit reports"
  ON public.content_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Only admins can view reports
CREATE POLICY "Admins can view all reports"
  ON public.content_reports FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE INDEX reports_status_idx ON public.content_reports(status);
CREATE INDEX reports_created_at_idx ON public.content_reports(created_at DESC);
