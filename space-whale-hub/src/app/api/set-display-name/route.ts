import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { displayName } = await request.json()
    
    if (!displayName) {
      return NextResponse.json({
        success: false,
        error: 'Display name is required'
      }, { status: 400 })
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 })
    }

    // Update user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        display_name: displayName
      }
    })

    if (updateError) {
      return NextResponse.json({
        success: false,
        error: updateError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Display name updated successfully'
    })
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 })
  }
}
