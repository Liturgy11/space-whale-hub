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
  try {
    const supabaseAdmin = getSupabaseAdmin()
    console.log('Fetching albums...')

    // First, fetch all albums
    const { data: albums, error: albumsError } = await supabaseAdmin
      .from('albums')
      .select('*')
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

    if (!albums || albums.length === 0) {
      console.log('No albums found')
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No albums found'
      })
    }

    // Fetch item counts for each album
    const albumsWithCounts = await Promise.all(
      albums.map(async (album) => {
        const { count, error: countError } = await supabaseAdmin
          .from('album_items')
          .select('id', { count: 'exact', head: true })
          .eq('album_id', album.id)

        if (countError) {
          console.warn(`Error counting items for album ${album.id}:`, countError)
        }

        return {
          ...album,
          item_count: count || 0
        }
      })
    )

    console.log(`Fetched ${albumsWithCounts.length} albums`)

    return NextResponse.json({
      success: true,
      data: albumsWithCounts,
      message: 'Albums fetched successfully'
    })

  } catch (error) {
    console.error('Get albums API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: error instanceof Error ? { message: error.message, stack: error.stack } : error
    }, { status: 500 })
  }
}



