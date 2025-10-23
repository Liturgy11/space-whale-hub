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

export async function POST(request: NextRequest) {
  try {
    const { itemId, content, userId } = await request.json()

    if (!itemId || !content || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Item ID, content, and user ID are required' 
      }, { status: 400 })
    }

    console.log('Creating archive comment:', { itemId, content, userId })

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
        success: false, 
        error: 'Archive comments table not found. Please run the supabase-archive-tables.sql script first.',
        suggestion: 'Go to your Supabase SQL editor and run the supabase-archive-tables.sql script to create the necessary tables.'
      }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('archive_comments')
      .insert({
        item_id: itemId,
        user_id: userId,
        content: content.trim()
      })
      .select(`
        *,
        profiles:user_id (
          display_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('Error creating archive comment:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log('Archive comment created successfully:', data)
    return NextResponse.json({ success: true, data })

  } catch (error: any) {
    console.error('API error creating archive comment:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
