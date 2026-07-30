import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyAuthUserOptional } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    await verifyAuthUserOptional(request)

    console.log('Fetching constellation items...')

    const { data, error } = await supabaseAdmin
      .from('archive_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching constellation items:', error)
      return NextResponse.json({
        success: false,
        error: `Failed to fetch constellation items: ${error.message}`,
        details: error
      }, { status: 500 })
    }

    console.log(`Fetched ${data?.length || 0} constellation items`)

    return NextResponse.json({
      success: true,
      data: data || [],
      message: 'Constellation items fetched successfully'
    })

  } catch (error) {
    console.error('Get constellation items API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error
    }, { status: 500 })
  }
}
