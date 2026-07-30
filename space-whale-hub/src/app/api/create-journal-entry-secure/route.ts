import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { assertMatchingUserId, verifyAuthUser } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const {
      title,
      content,
      content_encrypted,
      is_encrypted,
      encryption_key_id,
      encryption_salt,
      encryption_iv,
      mood,
      tags,
      media_url,
      media_type,
      is_private,
      userId
    } = await request.json()

    const mismatch = assertMatchingUserId(auth.userId, userId)
    if (mismatch) return mismatch

    const isMediaOnly = !content && !content_encrypted && media_url
    if (!content && !content_encrypted && !isMediaOnly) {
      return NextResponse.json({
        success: false,
        error: 'Content or encrypted content is required'
      }, { status: 400 })
    }

    if (is_encrypted) {
      if (!content_encrypted || !encryption_salt || !encryption_iv) {
        return NextResponse.json({
          success: false,
          error: 'Encrypted content requires salt and IV'
        }, { status: 400 })
      }
    }

    const supabaseAdmin = getSupabaseAdmin()

    let finalContent: string | null = null
    if (is_encrypted) {
      finalContent = null
    } else {
      finalContent = content?.trim() || null
      if (!finalContent && !media_url) {
        return NextResponse.json({
          success: false,
          error: 'Content is required for non-encrypted entries'
        }, { status: 400 })
      }
    }

    const { data, error } = await supabaseAdmin
      .from('journal_entries')
      .insert({
        user_id: auth.userId,
        title: title?.trim() || null,
        content: finalContent,
        content_encrypted: is_encrypted ? content_encrypted : null,
        is_encrypted: is_encrypted || false,
        encryption_key_id: is_encrypted ? encryption_key_id : null,
        encryption_salt: is_encrypted ? encryption_salt : null,
        encryption_iv: is_encrypted ? encryption_iv : null,
        mood: mood || null,
        tags: tags || [],
        media_url: media_url || null,
        media_type: media_type || null,
        is_private: is_private ?? true
      })
      .select('*')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    try {
      const ipAddress = request.headers.get('x-forwarded-for') ||
                       request.headers.get('x-real-ip') ||
                       null
      const userAgent = request.headers.get('user-agent') || null

      await supabaseAdmin.rpc('log_journal_access', {
        p_entry_id: data.id,
        p_user_id: auth.userId,
        p_action: 'create',
        p_ip_address: ipAddress,
        p_user_agent: userAgent
      })
    } catch (logError) {
      console.error('Failed to log journal access:', logError)
    }

    return NextResponse.json({
      success: true,
      entry: data
    })
  } catch (err: any) {
    console.error('API error:', err)
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 })
  }
}
