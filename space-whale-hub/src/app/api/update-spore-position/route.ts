import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyAuthUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const body = await request.json()
    const position_x = Number(body.position_x)
    const position_y = Number(body.position_y)

    if (!Number.isFinite(position_x) || !Number.isFinite(position_y)) {
      return NextResponse.json(
        { success: false, error: 'position_x and position_y are required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { error } = await supabaseAdmin
      .from('spores')
      .update({
        position_x,
        position_y,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', auth.userId)

    if (error) {
      console.error('Spore position update error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('API error:', err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
