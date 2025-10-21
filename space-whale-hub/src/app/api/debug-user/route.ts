import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Not authenticated',
        details: userError 
      })
    }
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'No user found' 
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata
      }
    })
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    })
  }
}
