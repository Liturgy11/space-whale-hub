import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering - don't evaluate at build time
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

export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    // Get limit and userId from query params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const userId = searchParams.get('userId') || null

    // Fetch posts with limit
    const { data: posts, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    const postIds = posts.map(p => p.id)

    // Build parallel queries array
    const queries: Promise<any>[] = [
      // Fetch minimal author profiles
      supabaseAdmin
        .from('profiles')
        .select('id, display_name, pronouns, avatar_url')
        .in('id', Array.from(new Set(posts.map(p => p.user_id)))),
      
      // Fetch all likes for these posts (just post_id, no need for full data)
      supabaseAdmin
        .from('likes')
        .select('post_id')
        .in('post_id', postIds),
      
      // Fetch all comments for these posts (just post_id, no need for full data)
      supabaseAdmin
        .from('comments')
        .select('post_id')
        .in('post_id', postIds)
    ]

    // If userId provided, also fetch user's likes
    if (userId) {
      queries.push(
        supabaseAdmin
          .from('likes')
          .select('post_id')
          .eq('user_id', userId)
          .in('post_id', postIds)
      )
    }

    // Execute all queries in parallel
    const results = await Promise.all(queries)
    const profilesResult = results[0]
    const likesResult = results[1]
    const commentsResult = results[2]
    const userLikesResult = userId ? results[3] : null

    // Build profile map
    const profileMap = new Map<string, any>()
    profilesResult.data?.forEach((p) => profileMap.set(p.id, p))

    // Build like count map
    const likeCountMap = new Map<string, number>()
    likesResult.data?.forEach((like) => {
      likeCountMap.set(like.post_id, (likeCountMap.get(like.post_id) || 0) + 1)
    })

    // Build comment count map
    const commentCountMap = new Map<string, number>()
    commentsResult.data?.forEach((comment) => {
      commentCountMap.set(comment.post_id, (commentCountMap.get(comment.post_id) || 0) + 1)
    })

    // Build user liked posts set
    const userLikedPosts = new Set<string>()
    userLikesResult?.data?.forEach((like) => {
      userLikedPosts.add(like.post_id)
    })

    // Enrich posts with counts (no async needed now!)
    const enriched = posts.map((post) => ({
      id: post.id,
      content: post.content,
      tags: post.tags || [],
      content_warning: post.content_warning_text,
      media_url: post.media_url,
      media_type: post.media_type,
      created_at: post.created_at,
      author: {
        id: post.user_id,
        display_name: profileMap.get(post.user_id)?.display_name || 'Space Whale',
        pronouns: profileMap.get(post.user_id)?.pronouns || null,
        avatar_url: profileMap.get(post.user_id)?.avatar_url || null,
      },
      likes_count: likeCountMap.get(post.id) || 0,
      comments_count: commentCountMap.get(post.id) || 0,
      is_liked: userLikedPosts.has(post.id)
    }))

    return NextResponse.json({ success: true, data: enriched })
  } catch (e: any) {
    console.error('API error fetching posts:', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}





