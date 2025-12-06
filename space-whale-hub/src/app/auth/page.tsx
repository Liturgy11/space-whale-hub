'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/auth/LoginForm'
import SignUpForm from '@/components/auth/SignUpForm'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()

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
