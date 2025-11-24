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

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const { itemId, userId } = await request.json()

    if (!itemId || !userId) {
      return NextResponse.json({ success: false, error: 'Item ID and User ID are required' }, { status: 400 })
    }

    console.log('Toggling like for archive item:', { itemId, userId })

    // Check if like already exists
    const { data: existingLike, error: checkError } = await supabaseAdmin
      .from('archive_likes')
      .select('id')
      .eq('item_id', itemId)
      .eq('user_id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing like:', checkError)
      return NextResponse.json({ success: false, error: checkError.message }, { status: 500 })
    }

    if (existingLike) {
      // Unlike - delete the like
      const { error: deleteError } = await supabaseAdmin
        .from('archive_likes')
        .delete()
        .eq('id', existingLike.id)

      if (deleteError) {
        console.error('Error deleting like:', deleteError)
        return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 })
      }

      console.log('Like removed successfully')
      return NextResponse.json({ success: true, liked: false })
    } else {
      // Like - create new like
      const { error: insertError } = await supabaseAdmin
        .from('archive_likes')
        .insert({
          item_id: itemId,
          user_id: userId
        })

      if (insertError) {
        console.error('Error creating like:', insertError)
        return NextResponse.json({ success: false, error: insertError.message }, { status: 500 })
      }

      console.log('Like added successfully')
      return NextResponse.json({ success: true, liked: true })
    }

  } catch (error: any) {
    console.error('API error toggling archive like:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
