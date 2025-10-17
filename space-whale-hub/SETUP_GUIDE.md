# Space Whale Hub - Setup Guide

## 🚀 Quick Start (15 minutes)

### 1. Set Up Environment Variables

Create a `.env.local` file in your project root:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://qrmdgbzmdtvqcuzfkwar.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**To get your anon key:**
1. Go to your Supabase dashboard
2. Settings → API
3. Copy the "anon public" key

### 2. Set Up Database Schema

1. Go to your Supabase dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `database-schema.sql`
5. Click "Run" to execute the schema

### 3. Set Up Storage Buckets

1. Go to "Storage" in your Supabase dashboard
2. Create these buckets:

**Bucket 1: `avatars`**
- Public: Yes
- File size limit: 2MB
- Allowed MIME types: `image/jpeg, image/png, image/gif, image/webp`

**Bucket 2: `posts`**
- Public: Yes
- File size limit: 10MB
- Allowed MIME types: `image/jpeg, image/png, image/gif, image/webp`

**Bucket 3: `archive`**
- Public: Yes
- File size limit: 50MB
- Allowed MIME types: `image/*, video/*, audio/*, application/pdf`

### 4. Set Up Storage Policies

Run this SQL in your Supabase SQL Editor:

```sql
-- Avatars: Users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Avatars: Users can update their own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Posts: Authenticated users can upload
CREATE POLICY "Authenticated users can upload post media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'posts' AND
    auth.role() = 'authenticated'
  );

-- Archive: Authenticated users can upload
CREATE POLICY "Authenticated users can upload archive media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'archive' AND
    auth.role() = 'authenticated'
  );

-- Everyone can view public buckets
CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Public can view posts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'posts');

CREATE POLICY "Public can view archive"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'archive');
```

### 5. Test Your Setup

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000`
3. You should be redirected to `/auth`
4. Try creating a new account
5. After signup, you should be able to access the Personal Space

## 🎯 What You Can Do Now

### ✅ Working Features:
- **User Authentication** - Sign up, login, logout
- **Personal Space** - Create and manage journal entries
- **User Profiles** - Display name and pronouns
- **Protected Routes** - Secure access to user content
- **Database Integration** - All data stored in Supabase

### 🚧 Next Steps:
- **Community Feed** - Posts, comments, likes
- **Archive System** - Upload and manage creative content
- **Workshop Registration** - Event management
- **File Uploads** - Images, videos, documents

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 🔧 Troubleshooting

### Common Issues:

**"Missing environment variables"**
- Make sure `.env.local` exists and has the correct values
- Restart your development server after adding environment variables

**"Email confirmation not working"**
- In Supabase dashboard → Authentication → Settings
- You can disable email confirmation for development

**"Database connection failed"**
- Check your Supabase URL and anon key
- Make sure your Supabase project is active

**"Row Level Security policy violation"**
- Check that you've run the database schema SQL
- Verify your RLS policies are set up correctly

## 📚 Next Development Steps

1. **Test the journal system** - Create some entries and verify they save
2. **Build community features** - Posts, comments, likes
3. **Add file uploads** - Images for posts and archive
4. **Implement workshops** - Registration and management
5. **Add moderation tools** - Content reporting and admin features

## 🎉 You're Ready!

Your Space Whale Hub now has:
- ✅ Complete authentication system
- ✅ Database with proper security
- ✅ Working journal functionality
- ✅ Beautiful, responsive UI
- ✅ Trauma-informed design

Start building your community! 🐋✨
