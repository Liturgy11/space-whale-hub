import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering - don't evaluate at build time
export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    const missing = []
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')
    throw new Error(`Missing Supabase environment variables: ${missing.join(', ')}. Please set them in your deployment environment variables (Vercel, etc.) or .env.local file.`)
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const { userId, mood, limit } = await request.json()
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 })
    }

    // Check environment variables before creating client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      const missing = []
      if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
      if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')
      return NextResponse.json({
        success: false,
        error: `Server configuration error: Missing Supabase environment variables: ${missing.join(', ')}. Please set them in your deployment environment variables.`
      }, { status: 500 })
    }

    // Create a Supabase client with service role (bypasses RLS)
    const supabaseAdmin = getSupabaseAdmin()

    // Build query
    let query = supabaseAdmin
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (mood) {
      query = query.eq('mood', mood)
    }

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    // Log access for each entry viewed
    // Note: This logs that the user accessed their journal entries list
    try {
      const ipAddress = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       null
      const userAgent = request.headers.get('user-agent') || null

      // Log access for each entry that was viewed
      if (data && data.length > 0) {
        const logPromises = data.map(async (entry: any) => {
          try {
            await supabaseAdmin.rpc('log_journal_access', {
              p_entry_id: entry.id,
              p_user_id: userId,
              p_action: 'view',
              p_ip_address: ipAddress,
              p_user_agent: userAgent
            })
          } catch (err) {
            // Don't fail if individual log fails - just log the error
            console.error(`Failed to log access for entry ${entry.id}:`, err)
          }
        })
        // Wait for all logs, but don't fail if any fail
        await Promise.allSettled(logPromises)
      }
    } catch (logError) {
      // Don't fail the request if logging fails, but log the error
      console.error('Failed to log journal access:', logError)
    }

    return NextResponse.json({
      success: true,
      entries: data || []
    })
  } catch (err: any) {
    console.error('API error:', err)
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 })
  }
}
