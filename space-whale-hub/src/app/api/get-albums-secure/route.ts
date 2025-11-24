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
    console.log('Fetching albums...')

    // Fetch albums with item counts using service role (bypasses RLS)
    const { data: albums, error: albumsError } = await supabaseAdmin
      .from('albums')
      .select(`
        *,
        album_items(count)
      `)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (albumsError) {
      console.error('Error fetching albums:', albumsError)
      return NextResponse.json({
        success: false,
        error: `Failed to fetch albums: ${albumsError.message}`,
        details: albumsError
      }, { status: 500 })
    }

    // Transform the data to include item counts
    const albumsWithCounts = albums?.map(album => ({
      ...album,
      item_count: album.album_items?.[0]?.count || 0
    })) || []

    console.log(`Fetched ${albumsWithCounts.length} albums`)

    return NextResponse.json({
      success: true,
      data: albumsWithCounts,
      message: 'Albums fetched successfully'
    })

  } catch (error) {
    console.error('Get albums API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error
    }, { status: 500 })
  }
}



