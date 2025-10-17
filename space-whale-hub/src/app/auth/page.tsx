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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 flex items-center justify-center p-4">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Space Whale Hub
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
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
