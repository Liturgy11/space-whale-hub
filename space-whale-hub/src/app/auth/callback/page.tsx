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
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    const errorCode = searchParams.get('error_code')

    // Forward any explicit Supabase errors to the reset page
    if (errorParam || errorCode) {
      const params = new URLSearchParams()
      if (errorParam) params.set('error', errorParam)
      if (errorCode) params.set('error_code', errorCode)
      if (errorDescription) params.set('error_description', errorDescription)
      router.replace(`/auth/reset-password?${params.toString()}`)
      return
    }

    // With implicit flow, Supabase puts tokens in the URL hash fragment:
    // /auth/callback#access_token=...&refresh_token=...&type=recovery
    // detectSessionInUrl: true (set in supabase client) processes this automatically.
    // We just need to listen for the resulting auth event and redirect accordingly.
    if (typeof window !== 'undefined') {
      const hash = window.location.hash

      if (hash && (hash.includes('type=recovery') || hash.includes('access_token'))) {
        // Supabase auto-processes the hash; listen for the resulting session event
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY' && session) {
            subscription.unsubscribe()
            router.replace('/auth/reset-password')
          } else if (event === 'SIGNED_IN' && session) {
            // Non-recovery sign-in from hash (e.g. magic link)
            subscription.unsubscribe()
            router.replace('/')
          }
        })

        // Timeout: if no auth event fires within 6s, something went wrong
        const timeout = setTimeout(() => {
          subscription.unsubscribe()
          router.replace('/auth/reset-password?error=exchange_failed&error_description=The+reset+link+is+invalid+or+has+expired.')
        }, 6000)

        return () => {
          subscription.unsubscribe()
          clearTimeout(timeout)
        }
      }

      // No hash and no error — redirect to auth
      router.replace('/auth')
    }
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
