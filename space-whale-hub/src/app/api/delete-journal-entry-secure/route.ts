import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { assertMatchingUserId, verifyAuthUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const { entryId, userId } = await request.json()

    const mismatch = assertMatchingUserId(auth.userId, userId)
    if (mismatch) return mismatch

    if (!entryId) {
      return NextResponse.json({ success: false, error: 'Missing entryId' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { data: entry, error: fetchError } = await supabaseAdmin
      .from('journal_entries')
      .select('id, user_id')
      .eq('id', entryId)
      .single()

    if (fetchError || !entry) {
      return NextResponse.json({ success: false, error: 'Entry not found' }, { status: 404 })
    }

    if (entry.user_id !== auth.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 403 })
    }

    const { error } = await supabaseAdmin
      .from('journal_entries')
      .delete()
      .eq('id', entryId)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
