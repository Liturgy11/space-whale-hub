import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return NextResponse.json({ success: false, error: 'Item ID is required' }, { status: 400 })
    }

    console.log('Fetching comments for archive item:', itemId)

    // Check if the table exists first
    const { data: tableCheck, error: tableError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'archive_comments')
      .single()

    if (tableError || !tableCheck) {
      console.log('Archive comments table does not exist yet')
      return NextResponse.json({ 
        success: true, 
        data: [],
        message: 'Archive comments table not found. Please run the supabase-archive-tables.sql script first.'
      })
    }

    const { data, error } = await supabaseAdmin
      .from('archive_comments')
      .select(`
        *,
        profiles:user_id (
          display_name,
          avatar_url
        )
      `)
      .eq('item_id', itemId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching archive comments:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log(`Fetched ${data?.length || 0} comments for archive item`)
    return NextResponse.json({ success: true, data })

  } catch (error: any) {
    console.error('API error fetching archive comments:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
