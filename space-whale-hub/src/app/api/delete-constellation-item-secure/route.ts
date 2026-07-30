import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyAuthUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: 'Item ID is required' }, { status: 400 })
    }

    const { data: item, error: fetchError } = await supabaseAdmin
      .from('archive_items')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (fetchError || !item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 })
    }

    if (item.user_id !== auth.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 403 })
    }

    console.log('Deleting constellation item:', id)

    const { error } = await supabaseAdmin
      .from('archive_items')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.userId)

    if (error) {
      console.error('Error deleting constellation item:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log('Constellation item deleted successfully')

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('API error deleting constellation item:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
