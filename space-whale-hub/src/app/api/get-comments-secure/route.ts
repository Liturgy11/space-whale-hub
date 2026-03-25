import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json()
    
    if (!postId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: postId'
      }, { status: 400 })
    }

    // Create a Supabase client with service role (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get comments using service role
    const { data, error } = await supabaseAdmin
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    // Fetch profiles for all commenters in one query
    const userIds = [...new Set(data.map((c: any) => c.user_id))]
    const profileMap = new Map<string, any>()

    if (userIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, display_name, pronouns, avatar_url, country')
        .in('id', userIds)

      if (profiles) {
        profiles.forEach((p: any) => profileMap.set(p.id, p))
      }
    }

    const commentsWithProfiles = data.map((comment: any) => ({
      ...comment,
      profiles: {
        display_name: profileMap.get(comment.user_id)?.display_name || 'Space Whale',
        pronouns: profileMap.get(comment.user_id)?.pronouns || null,
        avatar_url: profileMap.get(comment.user_id)?.avatar_url || null,
        country: profileMap.get(comment.user_id)?.country || null,
      }
    }))

    return NextResponse.json({
      success: true,
      comments: commentsWithProfiles
    })
  } catch (err: any) {
    console.error('API error:', err)
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 })
  }
}
