'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

interface SignUpFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export default function SignUpForm({ onSuccess, onSwitchToLogin }: SignUpFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [pronouns, setPronouns] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  const { signUp } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    const { error } = await signUp(email, password, displayName)
    
    if (error) {
      setError(error.message)
    } else {
      onSuccess?.()
    }
    
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-lofi-card rounded-xl shadow-lg p-8 rainbow-border-soft">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-space-whale-heading text-space-whale-navy mb-2">
            Join the Space Whale Community
          </h2>
          <p className="font-space-whale-body text-space-whale-purple">
            Create your account to begin your creative healing journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="displayName" className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
              Cosmic Name *
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors font-space-whale-body"
              placeholder="What should we call you?"
              suppressHydrationWarning
            />
          </div>

          <div>
            <label htmlFor="pronouns" className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
              Pronouns (optional)
            </label>
            <input
              id="pronouns"
              type="text"
              value={pronouns}
              onChange={(e) => setPronouns(e.target.value)}
              className="w-full px-4 py-3 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors font-space-whale-body"
              placeholder="e.g., they/them, she/her, he/him"
              suppressHydrationWarning
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors font-space-whale-body"
              placeholder="your@email.com"
              suppressHydrationWarning
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors font-space-whale-body"
                placeholder="Create a secure password"
                suppressHydrationWarning
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-space-whale-purple hover:text-space-whale-dark-purple"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs font-space-whale-body text-space-whale-purple mt-1">
              Must be at least 6 characters long
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors font-space-whale-body"
                placeholder="Confirm your password"
                suppressHydrationWarning
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-space-whale-purple hover:text-space-whale-dark-purple"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm font-space-whale-body">{error}</p>
            </div>
          )}

          <div className="bg-gradient-to-r from-space-whale-lavender/20 to-accent-pink/20 border border-space-whale-lavender/30 rounded-lg p-4">
            <p className="text-sm font-space-whale-body text-space-whale-navy">
              <strong>Community Guidelines:</strong> By signing up, you agree to create a safe, 
              trauma-informed, neuroaffirming, and gender-affirming space for all community members. 
              We celebrate diversity and welcome all identities and experiences.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-space-whale-purple to-accent-pink text-white font-space-whale-accent py-3 px-4 rounded-lg hover:from-space-whale-dark-purple hover:to-accent-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-space-whale-purple/30"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="font-space-whale-body text-space-whale-navy">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-space-whale-purple hover:text-space-whale-dark-purple font-space-whale-accent transition-colors"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
