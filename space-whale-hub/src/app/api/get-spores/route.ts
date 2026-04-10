import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) throw new Error('Missing Supabase env vars')
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { data, error } = await supabaseAdmin
      .from('spores')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Get spores error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Compute connections between spores
    const spores = data || []
    const connections: { source: string; target: string; type: 'shared_curiosity' | 'complementary' | 'shared_offering' }[] = []
    const seen = new Set<string>()

    for (let i = 0; i < spores.length; i++) {
      for (let j = i + 1; j < spores.length; j++) {
        const a = spores[i]
        const b = spores[j]
        const pairKey = `${a.user_id}-${b.user_id}`
        if (seen.has(pairKey)) continue

        const aOfferings: string[] = a.offerings || []
        const bOfferings: string[] = b.offerings || []
        const aCuriosities: string[] = a.curiosities || []
        const bCuriosities: string[] = b.curiosities || []

        // Shared curiosity
        const sharedCuriosity = aCuriosities.some(t => bCuriosities.includes(t))
        // Complementary: a offers what b is curious about, or vice versa
        const complementary = aOfferings.some(t => bCuriosities.includes(t)) || bOfferings.some(t => aCuriosities.includes(t))
        // Shared offering
        const sharedOffering = aOfferings.some(t => bOfferings.includes(t))

        // Priority: complementary > shared curiosity > shared offering (pick most interesting)
        if (complementary) {
          connections.push({ source: a.user_id, target: b.user_id, type: 'complementary' })
          seen.add(pairKey)
        } else if (sharedCuriosity) {
          connections.push({ source: a.user_id, target: b.user_id, type: 'shared_curiosity' })
          seen.add(pairKey)
        } else if (sharedOffering) {
          connections.push({ source: a.user_id, target: b.user_id, type: 'shared_offering' })
          seen.add(pairKey)
        }
      }
    }

    return NextResponse.json({ success: true, spores, connections })
  } catch (err: any) {
    console.error('API error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
