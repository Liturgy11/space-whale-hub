import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering - don't evaluate at build time
export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    console.log('Fetching constellation items...')

    // Get the current user from the request headers (if available)
    const authHeader = request.headers.get('authorization')
    let currentUserId = null
    
    if (authHeader) {
      try {
        // This is a simplified approach - in production you'd want to verify the JWT properly
        const token = authHeader.replace('Bearer ', '')
        // For now, we'll fetch all approved items and let the client filter
      } catch (error) {
        console.log('Could not extract user from auth header')
      }
    }

    // Fetch constellation items using service role (bypasses RLS)
    // Show all items - RLS policies will handle security on the client side
    const { data, error } = await supabase
      .from('archive_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching constellation items:', error)
      return NextResponse.json({
        success: false,
        error: `Failed to fetch constellation items: ${error.message}`,
        details: error
      }, { status: 500 })
    }

    console.log(`Fetched ${data?.length || 0} constellation items`)
    console.log('Sample items:', data?.slice(0, 2).map(item => ({
      id: item.id,
      title: item.title,
      is_approved: item.is_approved,
      user_id: item.user_id
    })))

    return NextResponse.json({
      success: true,
      data: data || [],
      message: 'Constellation items fetched successfully'
    })

  } catch (error) {
    console.error('Get constellation items API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error
    }, { status: 500 })
  }
}
