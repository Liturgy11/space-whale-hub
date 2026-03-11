'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    const type = searchParams.get('type')
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    const errorCode = searchParams.get('error_code')

    // Forward any errors from Supabase directly to the reset page
    if (errorParam || errorCode) {
      const params = new URLSearchParams()
      if (errorParam) params.set('error', errorParam)
      if (errorCode) params.set('error_code', errorCode)
      if (errorDescription) params.set('error_description', errorDescription)
      router.replace(`/auth/reset-password?${params.toString()}`)
      return
    }

    if (!code) {
      router.replace('/auth')
      return
    }

    // Try PKCE code exchange first, fall back to verifyOtp for cases where
    // the code verifier isn't in storage (e.g. email opened in a webview/different browser)
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (!error) {
        // PKCE exchange succeeded
        router.replace(type === 'recovery' ? '/auth/reset-password' : '/')
        return
      }

      console.warn('exchangeCodeForSession failed, trying verifyOtp fallback:', error.message)

      // Fallback: treat the code as a token_hash (works when PKCE verifier is unavailable)
      supabase.auth.verifyOtp({ token_hash: code, type: 'recovery' }).then(({ error: otpError }) => {
        if (otpError) {
          console.error('verifyOtp fallback also failed:', otpError.message)
          router.replace('/auth/reset-password?error=exchange_failed&error_description=The+reset+link+is+invalid+or+has+expired.')
        } else {
          router.replace('/auth/reset-password')
        }
      })
    })
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-white star-field flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-lofi-card rounded-xl shadow-lg p-8 rainbow-border-soft">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-space-whale-purple mx-auto mb-4" />
            <p className="text-space-whale-navy font-space-whale-body">Verifying reset link...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white star-field flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-lofi-card rounded-xl shadow-lg p-8 rainbow-border-soft">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-space-whale-purple mx-auto mb-4" />
              <p className="text-space-whale-navy font-space-whale-body">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
