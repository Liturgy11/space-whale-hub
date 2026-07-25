-- Run once in Supabase SQL Editor for faster Community Orbit loads (single DB round trip).
-- Safe to re-run: replaces the function if it already exists.

CREATE OR REPLACE FUNCTION public.get_community_feed(
  p_user_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 25
)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    json_agg(row_to_json(feed_row) ORDER BY feed_row.created_at DESC),
    '[]'::json
  )
  FROM (
    SELECT
      p.id,
      p.content,
      coalesce(p.tags, ARRAY[]::text[]) AS tags,
      p.content_warning_text,
      p.media_url,
      coalesce(
        p.media_urls,
        CASE WHEN p.media_url IS NOT NULL THEN ARRAY[p.media_url] ELSE ARRAY[]::text[] END
      ) AS media_urls,
      p.media_type,
      p.created_at,
      json_build_object(
        'id', p.user_id,
        'display_name', coalesce(pr.display_name, 'Space Whale'),
        'pronouns', pr.pronouns,
        'avatar_url', pr.avatar_url,
        'country', pr.country
      ) AS author,
      (SELECT count(*)::integer FROM public.likes l WHERE l.post_id = p.id) AS likes_count,
      (SELECT count(*)::integer FROM public.comments c WHERE c.post_id = p.id) AS comments_count,
      CASE
        WHEN p_user_id IS NULL THEN false
        ELSE EXISTS (
          SELECT 1 FROM public.likes l
          WHERE l.post_id = p.id AND l.user_id = p_user_id
        )
      END AS is_liked
    FROM public.posts p
    LEFT JOIN public.profiles pr ON pr.id = p.user_id
    ORDER BY p.created_at DESC
    LIMIT greatest(1, least(p_limit, 50))
  ) AS feed_row;
$$;

GRANT EXECUTE ON FUNCTION public.get_community_feed(uuid, integer) TO service_role;
