'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import LoginForm from '@/components/auth/LoginForm'
import SignUpForm from '@/components/auth/SignUpForm'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/760e5a7f-c1da-40b6-a7d0-e4cab2131118',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/page.tsx:18',message:'Auth page loaded',data:{url:window.location.href,hash:window.location.hash,search:window.location.search,pathname:window.location.pathname,hasCode:!!searchParams.get('code'),hasType:!!searchParams.get('type')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    }
    // #endregion
    
    // Check if this is a password reset link that landed on /auth instead of /auth/reset-password
    // This can happen if Supabase redirects to the Site URL instead of the redirectTo URL
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      const code = searchParams.get('code')
      const type = searchParams.get('type')
      const hasRecoveryHash = hash.includes('type=recovery') || hash.includes('access_token')
      const hasRecoveryParams = code && type === 'recovery'
      
      if (hasRecoveryHash || hasRecoveryParams) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/760e5a7f-c1da-40b6-a7d0-e4cab2131118',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/page.tsx:28',message:'Password reset link detected on /auth page - redirecting to reset-password',data:{hash,code:!!code,type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        // Redirect to reset password page with the same parameters
        const resetUrl = new URL('/auth/reset-password', window.location.origin)
        if (code) resetUrl.searchParams.set('code', code)
        if (type) resetUrl.searchParams.set('type', type)
        if (hash) resetUrl.hash = hash
        window.location.href = resetUrl.toString()
      }
    }
  }, [searchParams])

  const handleSuccess = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-white star-field flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/Space Whale_Horizontal.jpg"
            alt="Space Whale"
            width={300}
            height={90}
            className="mx-auto mb-4"
            priority
          />
          <h2 className="text-xl font-space-whale-body text-space-whale-navy mb-4">
            Space Whale Portal
          </h2>
          <p className="text-base font-space-whale-body text-space-whale-navy mb-6">
            Create, share, and connect.
          </p>
          <div className="w-24 h-px bg-space-whale-lavender/30 mx-auto"></div>
        </div>

        <div className="flex justify-center">
          {isLogin ? (
            <Suspense fallback={
              <div className="bg-lofi-card rounded-xl shadow-lg p-8 rainbow-border-soft w-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-space-whale-purple mx-auto mb-4" />
                  <p className="text-space-whale-navy font-space-whale-body">Loading...</p>
                </div>
              </div>
            }>
              <LoginForm 
                onSuccess={handleSuccess}
                onSwitchToSignUp={() => setIsLogin(false)}
              />
            </Suspense>
          ) : (
            <SignUpForm 
              onSuccess={handleSuccess}
              onSwitchToLogin={() => setIsLogin(true)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
