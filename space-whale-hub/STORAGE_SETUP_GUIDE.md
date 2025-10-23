# 🐋 Supabase Storage Setup Guide

## Step 1: Apply RLS Policies

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-storage-complete-fix.sql`
4. Click **Run** to execute the script

This will:
- Clean up all conflicting RLS policies
- Create proper storage buckets
- Set up working RLS policies
- Verify the configuration

## Step 2: Check Environment Variables

Make sure your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 3: Test Storage

1. Start your development server: `npm run dev`
2. Go to your personal space page
3. Click the "Storage Test" button
4. Check the browser console for detailed results

## Expected Results

✅ **Success**: All 4 buckets (avatars, posts, journal, archive) should upload successfully

❌ **Failure**: Check the console for specific error messages

## Troubleshooting

### Common Issues:

1. **"Service role key not found"**
   - Check that `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
   - Make sure the key is correct (starts with `eyJ...`)

2. **"Bucket does not exist"**
   - Run the SQL script again
   - Check the Supabase Storage dashboard

3. **"RLS policy violation"**
   - The SQL script should fix this
   - Make sure you ran the complete fix script

4. **"File type not allowed"**
   - Check the bucket configuration in the SQL script
   - Verify the file type is in the allowed list

## Next Steps

Once storage is working:

1. ✅ Test file uploads work
2. 🔄 Migrate components from base64 to storage URLs
3. 🎨 Update UI to display images from storage
4. 🧹 Clean up old storage implementations

## Storage Structure

Files are organized as:
```
{userId}/{category}/{filename}
```

Examples:
- `user123/avatars/profile.jpg`
- `user123/posts/vacation-photo.png`
- `user123/journal/reflection.jpg`
- `user123/archive/artwork.png`
