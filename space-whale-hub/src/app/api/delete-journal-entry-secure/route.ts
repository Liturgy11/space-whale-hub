import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { entryId, userId } = await request.json()

    if (!entryId || !userId) {
      return NextResponse.json({ success: false, error: 'Missing entryId or userId' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Only allow deleting own entries (verify ownership before deleting)
    const { data: entry, error: fetchError } = await supabaseAdmin
      .from('journal_entries')
      .select('id, user_id')
      .eq('id', entryId)
      .single()

    if (fetchError || !entry) {
      return NextResponse.json({ success: false, error: 'Entry not found' }, { status: 404 })
    }

    if (entry.user_id !== userId) {
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
