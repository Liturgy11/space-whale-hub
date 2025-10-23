import { NextRequest, NextResponse } from 'next/server'
import { testStorageSetup } from '@/lib/test-storage'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }
    
    console.log('🧪 Starting storage test for user:', userId)
    const results = await testStorageSetup(userId)
    
    return NextResponse.json({ 
      success: true, 
      results,
      message: 'Storage test completed. Check console for details.'
    })
    
  } catch (error: any) {
    console.error('Storage test error:', error)
    return NextResponse.json({ 
      error: error.message,
      success: false 
    }, { status: 500 })
  }
}

