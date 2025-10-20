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
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <Image
            src="/Space Whale_Horizontal.jpg"
            alt="Space Whale - Art Therapy"
            width={300}
            height={90}
            className="mx-auto mb-6"
            priority
          />
          <h1 className="text-4xl font-space-whale-heading text-space-whale-navy mb-4">
            Welcome to Space Whale Hub
          </h1>
          <p className="text-lg font-space-whale-body text-space-whale-navy max-w-2xl mx-auto">
            A digital sanctuary for creative expression, healing, and community connection. 
            Join our trauma-informed, neuroaffirming, and gender-affirming space.
          </p>
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
