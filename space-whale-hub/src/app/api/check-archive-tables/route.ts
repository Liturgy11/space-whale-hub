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
    console.log('Checking if archive tables exist...')

    // Check for archive_likes table
    const { data: likesTable, error: likesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'archive_likes')
      .single()

    // Check for archive_comments table
    const { data: commentsTable, error: commentsError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'archive_comments')
      .single()

    const tablesExist = {
      archive_likes: !likesError && likesTable,
      archive_comments: !commentsError && commentsTable
    }

    console.log('Archive tables status:', tablesExist)

    return NextResponse.json({
      success: true,
      tablesExist,
      message: tablesExist.archive_likes && tablesExist.archive_comments 
        ? 'All archive tables exist' 
        : 'Some archive tables are missing. Please run the supabase-archive-tables.sql script.'
    })

  } catch (error: any) {
    console.error('API error checking archive tables:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
