-- Profile UI flags + ensure country column exists
-- Run in Supabase SQL Editor

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS welcome_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS first_post_ack_at TIMESTAMPTZ;

-- Migrate existing auth metadata flags into profiles (one-time, safe to re-run)
UPDATE public.profiles p
SET
  welcome_seen_at = COALESCE(
    p.welcome_seen_at,
    (u.raw_user_meta_data->>'welcome_seen_at')::timestamptz
  ),
  first_post_ack_at = COALESCE(
    p.first_post_ack_at,
    (u.raw_user_meta_data->>'first_post_ack_at')::timestamptz
  ),
  country = COALESCE(p.country, u.raw_user_meta_data->>'country'),
  display_name = COALESCE(p.display_name, u.raw_user_meta_data->>'display_name'),
  pronouns = COALESCE(p.pronouns, u.raw_user_meta_data->>'pronouns'),
  avatar_url = COALESCE(p.avatar_url, u.raw_user_meta_data->>'avatar_url'),
  updated_at = NOW()
FROM auth.users u
WHERE u.id = p.id
  AND (
    p.welcome_seen_at IS NULL AND u.raw_user_meta_data->>'welcome_seen_at' IS NOT NULL
    OR p.first_post_ack_at IS NULL AND u.raw_user_meta_data->>'first_post_ack_at' IS NOT NULL
    OR p.country IS NULL AND u.raw_user_meta_data->>'country' IS NOT NULL
  );
