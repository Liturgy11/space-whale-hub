'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import LoginForm from '@/components/auth/LoginForm'
import SignUpForm from '@/components/auth/SignUpForm'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

// Component that uses searchParams - must be wrapped in Suspense
function AuthPageContent() {
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Check if this is a password reset link that landed on /auth instead of /auth/reset-password
    // This can happen if Supabase redirects to the Site URL instead of the redirectTo URL
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      const code = searchParams.get('code')
      const type = searchParams.get('type')
      const hasRecoveryHash = hash.includes('type=recovery') || hash.includes('access_token')
      const hasRecoveryParams = code && type === 'recovery'
      
      if (hasRecoveryHash || hasRecoveryParams) {
        // Bounce to callback so it can handle the tokens consistently
        const callbackUrl = new URL('/auth/callback', window.location.origin)
        if (code) callbackUrl.searchParams.set('code', code)
        if (type) callbackUrl.searchParams.set('type', type)
        if (hash) callbackUrl.hash = hash
        window.location.href = callbackUrl.toString()
      }
    }
  }, [searchParams])

  const handleSuccess = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen flex">
      {/* Artwork panel — hidden on mobile */}
      <div
        className="hidden md:block md:w-1/2 lg:w-3/5 relative"
        style={{
          backgroundImage: 'url(/cosmic-rainbow.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Subtle overlay so the logo reads over the art */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-8 left-8">
          <Image
            src="/Space Whale_Horizontal.jpg"
            alt="Space Whale"
            width={200}
            height={60}
            className="opacity-90"
            priority
          />
        </div>
      </div>

      {/* Form panel */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo — mobile only */}
          <div className="md:hidden text-center mb-8">
            <Image
              src="/Space Whale_Horizontal.jpg"
              alt="Space Whale"
              width={240}
              height={72}
              className="mx-auto mb-4"
              priority
            />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-xl font-space-whale-body text-space-whale-navy mb-2">
              Space Whale Portal
            </h2>
            <p className="text-base font-space-whale-body text-space-whale-navy">
              Create, share, and connect.
            </p>
          </div>

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

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-space-whale-purple" />
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  )
}
