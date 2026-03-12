'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const errorParam = searchParams.get('error')
    const errorCode = searchParams.get('error_code')
    const errorDescription = searchParams.get('error_description')

    // Forward explicit Supabase errors to the reset page
    if (errorParam || errorCode) {
      const params = new URLSearchParams()
      if (errorParam) params.set('error', errorParam)
      if (errorCode) params.set('error_code', errorCode)
      if (errorDescription) params.set('error_description', errorDescription)
      router.replace(`/auth/reset-password?${params.toString()}`)
      return
    }

    // Recovery flow: forward token_hash to reset-password so it can call
    // verifyOtp and updateUser on the same page (no cross-page session transfer).
    if (tokenHash && type === 'recovery') {
      router.replace(`/auth/reset-password?token_hash=${encodeURIComponent(tokenHash)}&type=recovery`)
      return
    }

    // Fallback: PKCE code in query param
    if (searchParams.get('code')) {
      const code = searchParams.get('code')!
      const type = searchParams.get('type')
      router.replace(
        type === 'recovery'
          ? `/auth/reset-password?code=${encodeURIComponent(code)}&type=recovery`
          : '/'
      )
      return
    }

    // Hash fragment tokens (implicit flow) — let Supabase auto-detect
    if (typeof window !== 'undefined' && window.location.hash?.includes('type=recovery')) {
      router.replace('/auth/reset-password' + window.location.hash)
      return
    }

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
