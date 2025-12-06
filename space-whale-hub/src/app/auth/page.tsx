'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/auth/LoginForm'
import SignUpForm from '@/components/auth/SignUpForm'
import Image from 'next/image'

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
            <LoginForm 
              onSuccess={handleSuccess}
              onSwitchToSignUp={() => setIsLogin(false)}
            />
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
