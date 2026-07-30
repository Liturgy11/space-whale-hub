import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return NextResponse.json({ success: false, error: 'Item ID is required' }, { status: 400 })
    }

    console.log('Fetching comments for archive item:', itemId)

    const { data, error } = await supabaseAdmin
      .from('archive_comments')
      .select('*')
      .eq('item_id', itemId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching archive comments:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const commentsWithNames = await Promise.all(
      (data || []).map(async (comment) => {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('display_name')
          .eq('id', comment.user_id)
          .single()

        return {
          ...comment,
          display_name: profile?.display_name || 'Anonymous'
        }
      })
    )

    console.log(`Fetched ${commentsWithNames?.length || 0} comments for archive item`)
    return NextResponse.json({ success: true, data: commentsWithNames })

  } catch (error: any) {
    console.error('API error fetching archive comments:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
