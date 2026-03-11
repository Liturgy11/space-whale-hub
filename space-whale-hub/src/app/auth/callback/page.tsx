'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { storeRecoveryTokens } from '@/lib/recoverySession'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash')
    const code = searchParams.get('code')
    const type = searchParams.get('type')
    const errorParam = searchParams.get('error')
    const errorCode = searchParams.get('error_code')
    const errorDescription = searchParams.get('error_description')

    // Forward any explicit errors from Supabase
    if (errorParam || errorCode) {
      const params = new URLSearchParams()
      if (errorParam) params.set('error', errorParam)
      if (errorCode) params.set('error_code', errorCode)
      if (errorDescription) params.set('error_description', errorDescription)
      router.replace(`/auth/reset-password?${params.toString()}`)
      return
    }

    // Preferred path: token_hash in URL (email template sends this directly).
    // Works in any browser — no PKCE verifier required.
    if (tokenHash && type === 'recovery') {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
        .then(({ data, error }) => {
          if (error) {
            router.replace('/auth/reset-password?error=otp_expired&error_description=The+reset+link+has+expired.+Please+request+a+new+one.')
            return
          }
          // Store tokens in a module-level variable — no localStorage/sessionStorage
          // needed, so quota issues can't affect this path.
          if (data?.session) {
            storeRecoveryTokens(data.session.access_token, data.session.refresh_token)
          }
          router.replace('/auth/reset-password?verified=true')
        })
      return
    }

    // Fallback: PKCE code exchange (works only when opened in the same browser
    // that initiated the reset — will fail in webviews / different browsers).
    if (code) {
      supabase.auth.exchangeCodeForSession(code)
        .then(({ error }) => {
          if (error) {
            // PKCE verifier missing — most likely opened in a different browser/webview
            router.replace('/auth/reset-password?error=browser_mismatch&error_description=Please+open+the+reset+link+in+the+same+browser+you+used+to+request+it,+or+request+a+new+reset+link.')
          } else {
            router.replace(type === 'recovery' ? '/auth/reset-password' : '/')
          }
        })
      return
    }

    // Hash fragment tokens (implicit flow)
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash
      if (hash.includes('type=recovery') || hash.includes('access_token')) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY' && session) {
            subscription.unsubscribe()
            router.replace('/auth/reset-password')
          } else if (event === 'SIGNED_IN' && session) {
            subscription.unsubscribe()
            router.replace('/')
          }
        })

        const timeout = setTimeout(() => {
          subscription.unsubscribe()
          router.replace('/auth/reset-password?error=otp_expired&error_description=The+reset+link+has+expired.')
        }, 8000)

        return () => {
          subscription.unsubscribe()
          clearTimeout(timeout)
        }
      }
    }

    // Nothing to process
    router.replace('/auth')
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
