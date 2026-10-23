import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { assertMatchingUserId, verifyAuthUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const { userId, mood, limit } = await request.json()

    const mismatch = assertMatchingUserId(auth.userId, userId)
    if (mismatch) return mismatch

    const supabaseAdmin = getSupabaseAdmin()

    let query = supabaseAdmin
      .from('journal_entries')
      .select('*')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false })

    if (mood) {
      query = query.eq('mood', mood)
    }

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (data && data.length > 0) {
      const ipAddress =
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
      const userAgent = request.headers.get('user-agent') || null
      data.forEach((entry: { id: string }) => {
        Promise.resolve(
          supabaseAdmin.rpc('log_journal_access', {
            p_entry_id: entry.id,
            p_user_id: auth.userId,
            p_action: 'view',
            p_ip_address: ipAddress,
            p_user_agent: userAgent,
          })
        ).catch((err: unknown) =>
          console.error(`Failed to log access for entry ${entry.id}:`, err)
        )
      })
    }

    return NextResponse.json({ success: true, entries: data || [] })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('API error:', err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
