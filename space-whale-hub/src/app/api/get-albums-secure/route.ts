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
    console.log('[get-albums-secure] Starting album fetch...')
    const supabaseAdmin = getSupabaseAdmin()
    console.log('[get-albums-secure] Supabase admin client created')

    // First, fetch all albums
    console.log('[get-albums-secure] Querying albums table...')
    const { data: albums, error: albumsError } = await supabaseAdmin
      .from('albums')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (albumsError) {
      console.error('[get-albums-secure] Error fetching albums:', albumsError)
      return NextResponse.json({
        success: false,
        error: `Failed to fetch albums: ${albumsError.message}`,
        details: albumsError,
        code: albumsError.code
      }, { status: 500 })
    }

    console.log(`[get-albums-secure] Found ${albums?.length || 0} albums`)

    if (!albums || albums.length === 0) {
      console.log('[get-albums-secure] No albums found in database')
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No albums found'
      })
    }

    // Fetch item counts for each album
    console.log('[get-albums-secure] Fetching item counts for albums...')
    const albumsWithCounts = await Promise.all(
      albums.map(async (album) => {
        try {
          const { count, error: countError } = await supabaseAdmin
            .from('album_items')
            .select('id', { count: 'exact', head: true })
            .eq('album_id', album.id)

          if (countError) {
            console.warn(`[get-albums-secure] Error counting items for album ${album.id}:`, countError)
          }

          return {
            ...album,
            item_count: count || 0
          }
        } catch (countErr) {
          console.warn(`[get-albums-secure] Exception counting items for album ${album.id}:`, countErr)
          return {
            ...album,
            item_count: 0
          }
        }
      })
    )

    console.log(`[get-albums-secure] Successfully fetched ${albumsWithCounts.length} albums with counts`)

    return NextResponse.json({
      success: true,
      data: albumsWithCounts,
      message: 'Albums fetched successfully'
    })

  } catch (error) {
    console.error('[get-albums-secure] API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const errorStack = error instanceof Error ? error.stack : undefined
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: {
        message: errorMessage,
        stack: errorStack,
        type: error instanceof Error ? error.constructor.name : typeof error
      }
    }, { status: 500 })
  }
}



