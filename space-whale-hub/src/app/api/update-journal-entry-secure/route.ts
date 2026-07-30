import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { assertMatchingUserId, verifyAuthUser } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const {
      entryId,
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

    const hasTags = Array.isArray(tags) && tags.length > 0
    if (!entryId || (!content && !content_encrypted && !media_url && !hasTags)) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: entryId and either content or media'
      }, { status: 400 })
    }

    if (is_encrypted && (!content_encrypted || !encryption_salt || !encryption_iv)) {
      return NextResponse.json({
        success: false,
        error: 'Encrypted entries require content_encrypted, encryption_salt, and encryption_iv'
      }, { status: 400 })
    }

    const finalContent = is_encrypted ? null : (content?.trim() || null)

    const supabaseAdmin = getSupabaseAdmin()

    const { data, error } = await supabaseAdmin
      .from('journal_entries')
      .update({
        title: title || null,
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
        is_private: is_private ?? true,
        updated_at: new Date().toISOString()
      })
      .eq('id', entryId)
      .eq('user_id', auth.userId)
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
        p_entry_id: entryId,
        p_user_id: auth.userId,
        p_action: 'update',
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
