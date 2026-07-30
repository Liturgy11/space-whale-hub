import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { assertMatchingUserId, verifyAuthUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const { itemId, userId } = await request.json()

    const mismatch = assertMatchingUserId(auth.userId, userId)
    if (mismatch) return mismatch

    if (!itemId) {
      return NextResponse.json({ success: false, error: 'Item ID is required' }, { status: 400 })
    }

    console.log('Toggling like for archive item:', { itemId, userId: auth.userId })

    const { data: existingLike, error: checkError } = await supabaseAdmin
      .from('archive_likes')
      .select('id')
      .eq('item_id', itemId)
      .eq('user_id', auth.userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing like:', checkError)
      return NextResponse.json({ success: false, error: checkError.message }, { status: 500 })
    }

    if (existingLike) {
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
    }

    const { error: insertError } = await supabaseAdmin
      .from('archive_likes')
      .insert({
        item_id: itemId,
        user_id: auth.userId
      })

    if (insertError) {
      console.error('Error creating like:', insertError)
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 })
    }

    console.log('Like added successfully')
    return NextResponse.json({ success: true, liked: true })

  } catch (error: any) {
    console.error('API error toggling archive like:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
