import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { assertMatchingUserId, verifyAuthUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const { itemId, content, userId } = await request.json()

    const mismatch = assertMatchingUserId(auth.userId, userId)
    if (mismatch) return mismatch

    if (!itemId || !content) {
      return NextResponse.json({
        success: false,
        error: 'Item ID and content are required'
      }, { status: 400 })
    }

    console.log('Creating archive comment:', { itemId, content, userId: auth.userId })

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('display_name')
      .eq('id', auth.userId)
      .single()

    const displayName = profile?.display_name || 'Anonymous'

    const { data, error } = await supabaseAdmin
      .from('archive_comments')
      .insert({
        item_id: itemId,
        user_id: auth.userId,
        content: content.trim()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating archive comment:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const commentWithName = {
      ...data,
      display_name: displayName
    }

    console.log('Archive comment created successfully:', commentWithName)
    return NextResponse.json({ success: true, data: commentWithName })

  } catch (error: any) {
    console.error('API error creating archive comment:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
