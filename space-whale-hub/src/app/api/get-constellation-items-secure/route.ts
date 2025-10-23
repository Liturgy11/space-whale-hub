import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching constellation items...')

    // Fetch constellation items using service role (bypasses RLS)
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
