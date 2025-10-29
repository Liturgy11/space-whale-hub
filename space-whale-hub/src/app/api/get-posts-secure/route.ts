import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function getLikeCount(postId: string) {
  const { count } = await supabaseAdmin
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)
  return count || 0
}

async function getCommentCount(postId: string) {
  const { count } = await supabaseAdmin
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)
  return count || 0
}

export async function GET(_request: NextRequest) {
  try {
    const { data: posts, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    // Fetch minimal author profiles
    const userIds = Array.from(new Set(posts.map(p => p.user_id)))
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, display_name, pronouns, avatar_url')
      .in('id', userIds)

    const profileMap = new Map<string, any>()
    profiles?.forEach((p) => profileMap.set(p.id, p))

    const enriched = await Promise.all(posts.map(async (post) => ({
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
      likes_count: await getLikeCount(post.id),
      comments_count: await getCommentCount(post.id),
      is_liked: false // computed client-side when user is known
    })))

    return NextResponse.json({ success: true, data: enriched })
  } catch (e: any) {
    console.error('API error fetching posts:', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}



