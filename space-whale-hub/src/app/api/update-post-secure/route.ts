import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { assertMatchingUserId, verifyAuthUser } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const { postId, userId, content, tags, content_warning, media_url, media_urls, media_type } =
      await request.json()

    const mismatch = assertMatchingUserId(auth.userId, userId)
    if (mismatch) return mismatch

    if (!postId || !content?.trim()) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { data: post, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('id, user_id')
      .eq('id', postId)
      .single()

    if (fetchError || !post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
    }

    if (post.user_id !== auth.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorised: You can only edit your own posts' }, { status: 403 })
    }

    const urlList: string[] = Array.isArray(media_urls)
      ? media_urls.filter((u: unknown) => typeof u === 'string' && u.length > 0)
      : media_url
        ? [media_url]
        : []

    const primaryUrl = urlList[0] || media_url || null
    const resolvedType =
      urlList.length > 1
        ? 'gallery'
        : urlList.length === 1
          ? media_type || 'image'
          : null

    const { data, error } = await supabaseAdmin
      .from('posts')
      .update({
        content: content.trim(),
        tags: tags || [],
        content_warning_text: content_warning || null,
        media_url: primaryUrl,
        media_urls: urlList.length > 0 ? urlList : null,
        media_type: resolvedType,
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .eq('user_id', auth.userId)
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
