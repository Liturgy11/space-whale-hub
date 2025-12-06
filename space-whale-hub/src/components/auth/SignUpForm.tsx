'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
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
  const [inviteCode, setInviteCode] = useState('')
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

    // TEMPORARILY DISABLED: Invite code requirement for testing
    // TODO: Re-enable invite code requirement before production
    /*
    if (!inviteCode.trim()) {
      setError('Invite code is required to join the Space Whale Portal')
      setLoading(false)
      return
    }

    // First validate the invite code
    try {
      const validateResponse = await fetch('/api/validate-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      })

      const validateData = await validateResponse.json()

      if (!validateData.valid) {
        setError('Invalid or expired invite code. Please check your code and try again.')
        setLoading(false)
        return
      }
    } catch (error) {
      setError('Failed to validate invite code. Please try again.')
      setLoading(false)
      return
    }
    */

    // Proceed with signup
    const { error } = await signUp(email, password, displayName)
    
    if (error) {
      setError(error.message)
    } else {
      // TEMPORARILY DISABLED: Invite code usage
      // TODO: Re-enable invite code usage before production
      /*
      // Use the invite code after successful signup
      try {
        // Get the current user ID
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user?.id) {
          const useResponse = await fetch('/api/use-invite', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              inviteCode: inviteCode.trim(),
              userId: user.id
            }),
          })

          const useData = await useResponse.json()

          if (!useData.success) {
            console.warn('Failed to use invite code:', useData.error)
            // Don't block signup if invite code usage fails
          }
        }
      } catch (error) {
        console.warn('Error using invite code:', error)
        // Don't block signup if invite code usage fails
      }
      */
    }

    onSuccess?.()
    setLoading(false)
  }

  return (
    <div className="w-full">
      <div className="bg-lofi-card rounded-xl shadow-lg p-8 rainbow-border-soft">
        <div className="text-center mb-6">
          <h2 className="text-xl font-space-whale-heading text-space-whale-navy mb-2">
            Join the Portal
          </h2>
          <p className="text-sm font-space-whale-body text-space-whale-navy">
            Made for LGBTIQA+, ND, disabled folks, and anyone seeking space to create, share, and connect.
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
            />
            <p className="text-xs font-space-whale-body text-space-whale-purple mt-1">
              You can change this anytime in your settings
            </p>
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
            />
          </div>

          {/* TEMPORARILY DISABLED: Invite code field for testing */}
          {/* TODO: Re-enable invite code field before production */}
          {/*
          <div>
            <label htmlFor="inviteCode" className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
              Invite Code *
            </label>
            <input
              id="inviteCode"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
              className="w-full px-4 py-3 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors font-space-whale-body"
              placeholder="Enter your invite code"
            />
            <p className="text-xs font-space-whale-body text-space-whale-purple mt-1">
              The Space Whale Portal is invite-only. Contact us if you need an invite code.
            </p>
          </div>
          */}

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
                className={`w-full px-4 py-3 pr-12 border rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:border-transparent transition-colors font-space-whale-body ${
                  password && password.length < 6
                    ? 'border-red-300 focus:ring-red-500'
                    : password && password.length >= 6
                    ? 'border-green-300 focus:ring-green-500'
                    : 'border-space-whale-lavender/30 focus:ring-space-whale-purple'
                }`}
                placeholder="Create a secure password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-space-whale-purple hover:text-space-whale-dark-purple"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {password && password.length < 6 && (
              <p className="mt-1 text-xs text-red-600 font-space-whale-body">Password must be at least 6 characters</p>
            )}
            {password && password.length >= 6 && (
              <p className="mt-1 text-xs text-green-600 font-space-whale-body">✓ Password length is good</p>
            )}
            {!password && (
              <p className="mt-1 text-xs font-space-whale-body text-space-whale-purple">Must be at least 6 characters long</p>
            )}
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
                className={`w-full px-4 py-3 pr-12 border rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:border-transparent transition-colors font-space-whale-body ${
                  confirmPassword && password !== confirmPassword
                    ? 'border-red-300 focus:ring-red-500'
                    : confirmPassword && password === confirmPassword
                    ? 'border-green-300 focus:ring-green-500'
                    : 'border-space-whale-lavender/30 focus:ring-space-whale-purple'
                }`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-space-whale-purple hover:text-space-whale-dark-purple"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-xs text-red-600 font-space-whale-body">Passwords do not match</p>
            )}
            {confirmPassword && password === confirmPassword && password.length >= 6 && (
              <p className="mt-1 text-xs text-green-600 font-space-whale-body">✓ Passwords match</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm font-space-whale-body">{error}</p>
            </div>
          )}

          <div className="bg-gradient-to-r from-space-whale-lavender/20 to-accent-pink/20 border border-space-whale-lavender/30 rounded-lg p-4">
            <p className="text-sm font-space-whale-body text-space-whale-navy">
              By creating an account, you're agreeing to show up with care, and trust that we're all doing our best together. Welcome home. 🐋
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
