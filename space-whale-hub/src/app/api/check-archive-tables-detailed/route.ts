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
    console.log('Checking archive tables in detail...')

    // Check if tables exist in information_schema
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public')
      .in('table_name', ['archive_likes', 'archive_comments', 'archive_items'])

    if (tablesError) {
      console.error('Error checking tables:', tablesError)
      return NextResponse.json({ 
        success: false, 
        error: `Error checking tables: ${tablesError.message}`,
        details: tablesError
      })
    }

    console.log('Tables found:', tables)

    // Try to query the tables directly
    const tableTests = {
      archive_items: null,
      archive_likes: null,
      archive_comments: null
    }

    // Test archive_items
    try {
      const { data: items, error: itemsError } = await supabaseAdmin
        .from('archive_items')
        .select('id')
        .limit(1)
      tableTests.archive_items = { success: !itemsError, error: itemsError?.message }
    } catch (error) {
      tableTests.archive_items = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }

    // Test archive_likes
    try {
      const { data: likes, error: likesError } = await supabaseAdmin
        .from('archive_likes')
        .select('id')
        .limit(1)
      tableTests.archive_likes = { success: !likesError, error: likesError?.message }
    } catch (error) {
      tableTests.archive_likes = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }

    // Test archive_comments
    try {
      const { data: comments, error: commentsError } = await supabaseAdmin
        .from('archive_comments')
        .select('id')
        .limit(1)
      tableTests.archive_comments = { success: !commentsError, error: commentsError?.message }
    } catch (error) {
      tableTests.archive_comments = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }

    return NextResponse.json({
      success: true,
      tablesInSchema: tables,
      tableTests,
      message: 'Archive tables detailed check completed'
    })

  } catch (error: any) {
    console.error('API error checking archive tables:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
