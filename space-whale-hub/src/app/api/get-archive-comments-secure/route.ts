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
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return NextResponse.json({ success: false, error: 'Item ID is required' }, { status: 400 })
    }

    console.log('Fetching comments for archive item:', itemId)

    const { data, error } = await supabaseAdmin
      .from('archive_comments')
      .select('*')
      .eq('item_id', itemId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching archive comments:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Get display names for all comments
    const commentsWithNames = await Promise.all(
      (data || []).map(async (comment) => {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('display_name')
          .eq('id', comment.user_id)
          .single()
        
        return {
          ...comment,
          display_name: profile?.display_name || 'Anonymous'
        }
      })
    )

    console.log(`Fetched ${commentsWithNames?.length || 0} comments for archive item`)
    return NextResponse.json({ success: true, data: commentsWithNames })

  } catch (error: any) {
    console.error('API error fetching archive comments:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
