import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .limit(1)
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error 
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection working!',
      data 
    })
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    })
  }
}






