'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import Image from 'next/image'

function ResetPasswordContent() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { updatePassword } = useAuth()

  useEffect(() => {
    setMounted(true)
    
    // Supabase password reset links can come in two formats:
    // 1. Hash fragments (automatically processed) - e.g., #access_token=...
    // 2. Query parameters (need manual processing) - e.g., ?code=...
    const initializeReset = async () => {
      // Log the current URL for debugging
      if (typeof window !== 'undefined') {
        console.log('Reset password page URL:', window.location.href)
        console.log('Hash:', window.location.hash)
        console.log('Search params:', window.location.search)
      }

      // Check for error parameters first (from Supabase redirect)
      const errorParam = searchParams.get('error')
      const errorCode = searchParams.get('error_code')
      const errorDescription = searchParams.get('error_description')
      
      // Also check hash fragments for errors
      let hashError = null
      if (typeof window !== 'undefined' && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        hashError = hashParams.get('error') || hashParams.get('error_code')
      }
      
      if (errorParam || errorCode || hashError) {
        console.log('Error detected in URL:', { errorParam, errorCode, errorDescription, hashError })
        if (errorCode === 'otp_expired' || hashError === 'otp_expired') {
          setError('This reset link has expired. Please request a new password reset email.')
        } else if (errorParam === 'access_denied' || hashError === 'access_denied') {
          setError('Access denied. This reset link is invalid or has expired. Please request a new password reset email.')
        } else {
          setError(errorDescription?.replace(/\+/g, ' ') || 'This reset link is invalid or has expired. Please request a new password reset email.')
        }
        setInitializing(false)
        return
      }

      // First, check if we already have a session
      let { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        console.log('Session already exists')
        // Already have a recovery session
        setInitializing(false)
        return
      }

      // Check for hash fragments first (Supabase processes these automatically)
      // Wait a moment for Supabase to process hash fragments from URL
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const { data: { session: hashSession } } = await supabase.auth.getSession()
      if (hashSession) {
        console.log('Hash session found')
        setInitializing(false)
        return
      }

      // If no hash fragments, check for query parameters
      const code = searchParams.get('code')
      const type = searchParams.get('type')
      
      console.log('Code from URL:', code)
      console.log('Type from URL:', type)
      
      if (!code && !type) {
        // No code in URL - invalid link
        console.log('No code or type found in URL')
        setError('Invalid reset link. Please request a new password reset email.')
        setInitializing(false)
        return
      }

      // We have a code in query params
      // IMPORTANT: Supabase password reset links should redirect through Supabase servers first
      // (https://[project].supabase.co/auth/v1/verify?token=...&type=recovery&redirect_to=...)
      // which then redirects to your app with hash fragments (#access_token=...).
      // 
      // If we're getting query parameters directly, it likely means:
      // 1. The email template is using a custom format instead of {{ .ConfirmationURL }}
      // 2. The redirect URL doesn't match exactly (but your config looks correct)
      // 
      // The Supabase client's detectSessionInUrl only works with hash fragments, not query params.
      // Query param codes need to go through Supabase's verification endpoint first.
      
      // Check if there's a hash fragment we should be using instead
      if (typeof window !== 'undefined' && window.location.hash) {
        // Hash fragment exists - Supabase will process it
        await new Promise(resolve => setTimeout(resolve, 1000))
        const { data: { session: hashSession2 } } = await supabase.auth.getSession()
        if (hashSession2) {
          console.log('Hash session found after waiting')
          setInitializing(false)
          return
        }
      }
      
      // If we have a code in query params, we need to redirect through Supabase's verification
      // endpoint first. The code should be a token that needs verification.
      if (code && typeof window !== 'undefined') {
        console.log('Code found in query params - attempting to redirect through Supabase verification')
        // Construct the Supabase verification URL
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrmdgbzmdtvqcuzfkwar.supabase.co'
        const redirectTo = encodeURIComponent(window.location.origin + '/auth/reset-password')
        const verifyUrl = `${supabaseUrl}/auth/v1/verify?token=${code}&type=recovery&redirect_to=${redirectTo}`
        
        console.log('Redirecting to Supabase verification:', verifyUrl)
        // Redirect to Supabase's verification endpoint, which will then redirect back with hash fragments
        window.location.href = verifyUrl
        return // Don't continue - we're redirecting
      }

      // Listen for auth state changes - Supabase should process the code automatically
      let sessionEstablished = false
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event, session ? 'has session' : 'no session')
        if (event === 'PASSWORD_RECOVERY' && session) {
          console.log('PASSWORD_RECOVERY event detected with session')
          sessionEstablished = true
          setError('')
          setInitializing(false)
        } else if (event === 'SIGNED_IN' && session) {
          // Sometimes password recovery creates a SIGNED_IN event
          console.log('SIGNED_IN event detected - might be recovery session')
          sessionEstablished = true
          setError('')
          setInitializing(false)
        } else if (session && !sessionEstablished) {
          console.log('Session detected from auth state change')
          sessionEstablished = true
          setError('')
          setInitializing(false)
        }
      })

      // Give Supabase more time to process the code from query params
      // The Supabase client should automatically detect and process recovery codes
      // Wait in increments to check for session
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const { data: { session: checkSession } } = await supabase.auth.getSession()
        if (checkSession) {
          console.log('Session found after waiting', i + 1, 'seconds')
          sessionEstablished = true
          setError('')
          setInitializing(false)
          subscription.unsubscribe()
          return
        }
      }
      
      // Final check after all waiting
      const { data: { session: finalSession } } = await supabase.auth.getSession()
      
      if (finalSession) {
        console.log('Final session check: session exists')
        setError('')
        sessionEstablished = true
        setInitializing(false)
      } else if (!sessionEstablished) {
        // No session established - the code might be expired, invalid, or the redirect URL doesn't match
        console.log('No session established after waiting. Code might be invalid or redirect URL mismatch.')
        setError('This reset link is invalid or has expired. Please request a new password reset email.')
        setInitializing(false)
      }
      
      // Clean up subscription
      setTimeout(() => {
        subscription.unsubscribe()
      }, 1000)
    }

    initializeReset()
  }, [searchParams])

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

    try {
      const { error } = await updatePassword(password)
      
      if (error) {
        console.error('Update password error details:', error)
        // Provide more helpful error messages
        if (error.message?.includes('session') || error.message?.includes('Auth session missing')) {
          setError('This reset link is invalid or has expired. Please request a new password reset email.')
        } else {
          setError(error.message || 'Failed to update password. Please try again.')
        }
      } else {
        setSuccess(true)
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/auth')
        }, 2000)
      }
    } catch (err: any) {
      console.error('Update password error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || initializing) {
    return (
      <div className="min-h-screen bg-white star-field flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-lofi-card rounded-xl shadow-lg p-8 rainbow-border-soft">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-space-whale-purple mx-auto mb-4" />
              <p className="text-space-whale-navy font-space-whale-body">
                {error ? 'Verifying reset link...' : 'Processing reset link...'}
              </p>
              {error && (
                <p className="text-red-600 text-sm mt-4">{error}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
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
          </div>
          <div className="bg-lofi-card rounded-xl shadow-lg p-8 rainbow-border-soft">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-space-whale-heading text-space-whale-navy mb-4">
                Password Reset Successful!
              </h2>
              <p className="font-space-whale-body text-space-whale-navy mb-6">
                Your password has been updated. Redirecting to sign in...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
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

        <div className="bg-lofi-card rounded-xl shadow-lg p-8 rainbow-border-soft">
          {error && !initializing ? (
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push('/auth')}
                    className="block w-full text-space-whale-purple hover:text-space-whale-dark-purple font-space-whale-body underline"
                  >
                    Return to sign in
                  </button>
                  <p className="text-space-whale-navy/70 text-sm">
                    or{' '}
                    <button
                      onClick={() => router.push('/auth?forgot=true')}
                      className="text-space-whale-purple hover:text-space-whale-dark-purple font-space-whale-body underline"
                    >
                      request a new reset link
                    </button>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-space-whale-heading text-space-whale-navy mb-2">
                  Set New Password
                </h2>
                <p className="text-sm font-space-whale-body text-space-whale-navy/70">
                  Enter your new password below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors font-space-whale-body"
                  placeholder="New Password"
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
            </div>

            <div>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors font-space-whale-body"
                  placeholder="Confirm New Password"
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
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-space-whale-purple to-accent-pink text-white font-space-whale-accent py-3 px-4 rounded-lg hover:from-space-whale-dark-purple hover:to-accent-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-space-whale-purple/30"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Updating Password...
                </div>
              ) : (
                'Update Password'
              )}
            </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white star-field flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-lofi-card rounded-xl shadow-lg p-8 rainbow-border-soft">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-space-whale-purple mx-auto mb-4" />
              <p className="text-space-whale-navy font-space-whale-body">
                Loading...
              </p>
            </div>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}

