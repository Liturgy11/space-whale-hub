import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
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
    
    // Content is required unless it's encrypted (then content_encrypted is required)
    if (!content && !content_encrypted) {
      return NextResponse.json({
        success: false,
        error: 'Content or encrypted content is required'
      }, { status: 400 })
    }

    // If encrypted, validate encryption fields
    if (is_encrypted) {
      if (!content_encrypted || !encryption_salt || !encryption_iv) {
        return NextResponse.json({
          success: false,
          error: 'Encrypted content requires salt and IV'
        }, { status: 400 })
      }
    }

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Server configuration error: Missing Supabase environment variables'
      }, { status: 500 })
    }

    // Create a Supabase client with service role (bypasses RLS)
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Prepare content - if encrypted, don't store plain text
    let finalContent: string | null = null
    if (is_encrypted) {
      // Don't store plain text when encrypted
      finalContent = null
    } else {
      // Store plain text content
      finalContent = content?.trim() || null
      if (!finalContent) {
        return NextResponse.json({
          success: false,
          error: 'Content is required for non-encrypted entries'
        }, { status: 400 })
      }
    }

    // Create the journal entry using service role
    const { data, error } = await supabaseAdmin
      .from('journal_entries')
      .insert({
        user_id: userId,
        title: title?.trim() || null,
        content: finalContent, // null if encrypted, otherwise the plain text
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

    // Log access (create action)
    // Note: Audit trail is automatically created by trigger, but we log explicit access
    try {
      const ipAddress = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       null
      const userAgent = request.headers.get('user-agent') || null

      await supabaseAdmin.rpc('log_journal_access', {
        p_entry_id: data.id,
        p_user_id: userId,
        p_action: 'create',
        p_ip_address: ipAddress,
        p_user_agent: userAgent
      })
    } catch (logError) {
      // Don't fail the request if logging fails, but log the error
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
