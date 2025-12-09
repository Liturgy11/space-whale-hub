import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { 
      entryId,
      title, 
      content, 
      mood, 
      tags, 
      media_url, 
      media_type,
      is_private,
      userId 
    } = await request.json()
    
    if (!entryId || !content || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: entryId, content, and userId'
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

    // Update the journal entry using service role
    const { data, error } = await supabaseAdmin
      .from('journal_entries')
      .update({
        title: title || null,
        content: content.trim(),
        mood: mood || null,
        tags: tags || [],
        media_url: media_url || null,
        media_type: media_type || null,
        is_private: is_private ?? true,
        updated_at: new Date().toISOString()
      })
      .eq('id', entryId)
      .eq('user_id', userId) // Ensure user can only update their own entries
      .select('*')
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    // Log access (update action)
    // Note: Audit trail is automatically created by trigger, but we log explicit access
    try {
      const ipAddress = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       null
      const userAgent = request.headers.get('user-agent') || null

      await supabaseAdmin.rpc('log_journal_access', {
        p_entry_id: entryId,
        p_user_id: userId,
        p_action: 'update',
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
