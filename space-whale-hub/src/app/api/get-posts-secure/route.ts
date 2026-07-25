import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

const POST_COLUMNS =
  'id, content, tags, content_warning_text, media_url, media_urls, media_type, created_at, user_id'

async function fetchFeedViaRpc(
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
  userId: string | null,
  limit: number
) {
  const { data, error } = await supabaseAdmin.rpc('get_community_feed', {
    p_user_id: userId,
    p_limit: limit,
  })

  if (error) throw error
  return Array.isArray(data) ? data : []
}

async function fetchFeedLegacy(
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
  userId: string | null,
  limit: number
) {
  const { data: posts, error } = await supabaseAdmin
    .from('posts')
    .select(POST_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  if (!posts || posts.length === 0) return []

  const postIds = posts.map((p) => p.id)
  const userIds = Array.from(new Set(posts.map((p) => p.user_id)))

  const queries: Promise<{ data: any[] | null; error: any }>[] = [
    supabaseAdmin
      .from('profiles')
      .select('id, display_name, pronouns, avatar_url, country')
      .in('id', userIds)
      .then((r) => r),
    supabaseAdmin
      .from('likes')
      .select('post_id')
      .in('post_id', postIds)
      .then((r) => r),
    supabaseAdmin
      .from('comments')
      .select('post_id')
      .in('post_id', postIds)
      .then((r) => r),
  ]

  if (userId) {
    queries.push(
      supabaseAdmin
        .from('likes')
        .select('post_id')
        .eq('user_id', userId)
        .in('post_id', postIds)
        .then((r) => r)
    )
  }

  const results = await Promise.all(queries)
  const [profilesResult, likesResult, commentsResult, userLikesResult] = results

  const profileMap = new Map<string, any>()
  profilesResult.data?.forEach((p: any) => profileMap.set(p.id, p))

  const likeCountMap = new Map<string, number>()
  likesResult.data?.forEach((like: any) => {
    likeCountMap.set(like.post_id, (likeCountMap.get(like.post_id) || 0) + 1)
  })

  const commentCountMap = new Map<string, number>()
  commentsResult.data?.forEach((comment: any) => {
    commentCountMap.set(
      comment.post_id,
      (commentCountMap.get(comment.post_id) || 0) + 1
    )
  })

  const userLikedPosts = new Set<string>()
  userLikesResult?.data?.forEach((like: any) => {
    userLikedPosts.add(like.post_id)
  })

  return posts.map((post) => ({
    id: post.id,
    content: post.content,
    tags: post.tags || [],
    content_warning: post.content_warning_text,
    media_url: post.media_url,
    media_urls: post.media_urls || (post.media_url ? [post.media_url] : []),
    media_type: post.media_type,
    created_at: post.created_at,
    author: {
      id: post.user_id,
      display_name: profileMap.get(post.user_id)?.display_name || 'Space Whale',
      pronouns: profileMap.get(post.user_id)?.pronouns || null,
      avatar_url: profileMap.get(post.user_id)?.avatar_url || null,
      country: profileMap.get(post.user_id)?.country || null,
    },
    likes_count: likeCountMap.get(post.id) || 0,
    comments_count: commentCountMap.get(post.id) || 0,
    is_liked: userLikedPosts.has(post.id),
  }))
}

export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()

  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get('limit') || '25', 10))
    )
    const userId = searchParams.get('userId') || null

    let enriched: any[] = []

    try {
      enriched = await fetchFeedViaRpc(supabaseAdmin, userId, limit)
    } catch (rpcError) {
      console.warn('Feed RPC unavailable, using legacy queries:', rpcError)
      enriched = await fetchFeedLegacy(supabaseAdmin, userId, limit)
    }

    const cacheHeaders = userId
      ? { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=60' }
      : { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' }

    return NextResponse.json(
      { success: true, data: enriched },
      { headers: cacheHeaders }
    )
  } catch (e: any) {
    console.error('API error fetching posts:', e)
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    )
  }
}
