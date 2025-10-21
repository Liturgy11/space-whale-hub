import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { userId, displayName } = await request.json()
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 })
    }

    // Create a profile for the user
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        display_name: displayName || 'Lit',
        pronouns: null,
        avatar_url: null,
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      // If profile already exists, that's okay
      if (error.code === '23505') {
        return NextResponse.json({
          success: true,
          message: 'Profile already exists'
        })
      }
      
      console.error('Profile creation error:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      profile: data
    })
  } catch (err: any) {
    console.error('API error:', err)
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 })
  }
}
