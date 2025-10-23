'use client'

import { useEffect } from 'react'

export default function EnvDebug() {
  useEffect(() => {
    console.log('🔍 Environment Variables Debug:')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing')
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing')
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing')
    
    // Check if the service role key starts with the expected format
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Service role key starts with:', process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...')
    }
  }, [])

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-sm font-medium text-yellow-800 mb-2">Environment Debug</h3>
      <p className="text-xs text-yellow-700">
        Check the browser console for environment variable status.
      </p>
    </div>
  )
}
