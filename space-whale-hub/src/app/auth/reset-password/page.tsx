'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { consumeRecoveryTokens } from '@/lib/recoverySession'
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

  const router = useRouter()
  const searchParams = useSearchParams()
  const { updatePassword } = useAuth()

  useEffect(() => {
    const errorParam = searchParams.get('error')
    const errorCode = searchParams.get('error_code')
    const errorDescription = searchParams.get('error_description')
    const verified = searchParams.get('verified')

    // Show errors forwarded from /auth/callback
    if (errorParam || errorCode) {
      setError(
        decodeURIComponent(errorDescription || '').replace(/\+/g, ' ') ||
        'This reset link is invalid or has expired. Please request a new password reset email.'
      )
      setInitializing(false)
      return
    }

    // callback page verified the OTP — show the form, but also ensure
    // we have a session before allowing the password update to proceed.
    if (verified === 'true') {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setInitializing(false)
          return
        }
        // Session may still be propagating — listen for it
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session) {
            setInitializing(false)
            subscription.unsubscribe()
          }
        })
        const timeout = setTimeout(() => {
          subscription.unsubscribe()
          // verifyOtp succeeded so just show the form anyway and let
          // updatePassword fail with a clear message if session is truly gone
          setInitializing(false)
        }, 3000)
        return () => { clearTimeout(timeout); subscription.unsubscribe() }
      })
      return
    }

    // Fallback: check for an existing session (e.g. user navigated here directly)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setInitializing(false)
      } else {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session) {
            setInitializing(false)
            subscription.unsubscribe()
          }
        })

        const timeout = setTimeout(() => {
          subscription.unsubscribe()
          setError('No valid reset session found. Please request a new password reset email.')
          setInitializing(false)
        }, 5000)

        return () => {
          clearTimeout(timeout)
          subscription.unsubscribe()
        }
      }
    })
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

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
      // Re-establish the recovery session from stashed tokens.
      // Try module-level variable first (client-side nav), then sessionStorage
      // (survives full-page reloads in webviews). The token strings are tiny
      // so sessionStorage quota is never an issue.
      try {
        let tokens = consumeRecoveryTokens()
        if (!tokens) {
          const at = sessionStorage.getItem('_sw_reset_at')
          const rt = sessionStorage.getItem('_sw_reset_rt')
          if (at && rt) tokens = { accessToken: at, refreshToken: rt }
        }
        if (tokens) {
          sessionStorage.removeItem('_sw_reset_at')
          sessionStorage.removeItem('_sw_reset_rt')
          await supabase.auth.setSession({
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
          })
        }
      } catch (_) {}

      const { error } = await updatePassword(password)

      if (error) {
        if (error.message?.includes('session') || error.message?.includes('Auth session missing')) {
          setError('This reset link is invalid or has expired. Please request a new password reset email.')
        } else {
          setError(error.message || 'Failed to update password. Please try again.')
        }
      } else {
        setSuccess(true)
        setTimeout(() => router.push('/auth'), 2000)
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (initializing) {
    return (
      <div className="min-h-screen bg-white star-field flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-lofi-card rounded-xl shadow-lg p-8 rainbow-border-soft">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-space-whale-purple mx-auto mb-4" />
              <p className="text-space-whale-navy font-space-whale-body">Processing reset link...</p>
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
          {error ? (
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
                <p className="text-red-600 text-sm mb-4 font-space-whale-body">{error}</p>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/auth?forgot=true')}
                    className="block w-full bg-gradient-to-r from-space-whale-purple to-accent-pink text-white font-space-whale-accent py-3 px-4 rounded-lg hover:from-space-whale-dark-purple hover:to-accent-pink/90 transition-all duration-300 shadow-lg hover:shadow-space-whale-purple/30"
                  >
                    Request New Reset Link
                  </button>
                  <button
                    onClick={() => router.push('/auth')}
                    className="block w-full text-space-whale-purple hover:text-space-whale-dark-purple font-space-whale-body text-sm underline"
                  >
                    Return to sign in
                  </button>
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
              <p className="text-space-whale-navy font-space-whale-body">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
