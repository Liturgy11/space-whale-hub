import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { postId, userId, content, tags, content_warning, media_url, media_type } = await request.json()

    if (!postId || !userId || !content?.trim()) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Verify ownership before updating
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('id, user_id')
      .eq('id', postId)
      .single()

    if (fetchError || !post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
    }

    if (post.user_id !== userId) {
      return NextResponse.json({ success: false, error: 'Unauthorised: You can only edit your own posts' }, { status: 403 })
    }

    const { data, error } = await supabaseAdmin
      .from('posts')
      .update({
        content: content.trim(),
        tags: tags || [],
        content_warning_text: content_warning || null,
        media_url: media_url || null,
        media_type: media_type || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .eq('user_id', userId)
      .select('*')
      .single()

    if (error) {
      console.error('Update post error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, post: data })
  } catch (err: any) {
    console.error('API error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
