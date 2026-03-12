'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // Errors forwarded from /auth/callback
    if (errorParam) {
      setError(
        decodeURIComponent(errorDescription || '').replace(/\+/g, ' ') ||
        'This reset link is invalid or has expired. Please request a new password reset email.'
      )
      setInitializing(false)
      return
    }

    // Primary path: token_hash provided.
    // Call Supabase's /auth/v1/verify REST endpoint directly, bypassing the
    // SDK's PKCE layer which intercepts verifyOtp and prevents it returning a
    // usable session when flowType is 'pkce'.
    if (tokenHash && type === 'recovery') {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrmdgbzmdtvqcuzfkwar.supabase.co'
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

      fetch(`${supabaseUrl}/auth/v1/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ token_hash: tokenHash, type: 'recovery' }),
      })
        .then(r => r.json())
        .then(async (data) => {
          if (data.error || data.error_description || !data.access_token) {
            setError('This reset link has expired or is invalid. Please request a new password reset email.')
            setInitializing(false)
            return
          }
          // Set the session on the Supabase client using the real tokens
          try {
            await supabase.auth.setSession({
              access_token: data.access_token,
              refresh_token: data.refresh_token,
            })
          } catch (_) {
            // setSession may fail to persist due to storage quota, but the
            // in-memory session is set — updateUser will still work.
          }
          setInitializing(false)
        })
        .catch(() => {
          setError('Network error verifying reset link. Please try again.')
          setInitializing(false)
        })
      return
    }

    // Fallback: PKCE code (same-browser flow)
    const code = searchParams.get('code')
    if (code && type === 'recovery') {
      supabase.auth.exchangeCodeForSession(code)
        .then(({ error }) => {
          if (error) {
            setError('This reset link has expired or could not be verified. Please request a new password reset email.')
          }
          setInitializing(false)
        })
      return
    }

    // No token at all — check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setInitializing(false)
      } else {
        setError('No valid reset session found. Please request a new password reset email.')
        setInitializing(false)
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
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setError(error.message || 'Failed to update password. Please try again.')
      } else {
        setSuccess(true)
        setTimeout(() => router.push('/auth'), 2000)
      }
    } catch {
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
            <Image src="/Space Whale_Horizontal.jpg" alt="Space Whale" width={300} height={90} className="mx-auto mb-4" priority />
          </div>
          <div className="bg-lofi-card rounded-xl shadow-lg p-8 rainbow-border-soft">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-space-whale-heading text-space-whale-navy mb-4">Password Reset Successful!</h2>
              <p className="font-space-whale-body text-space-whale-navy mb-6">Your password has been updated. Redirecting to sign in...</p>
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
          <Image src="/Space Whale_Horizontal.jpg" alt="Space Whale" width={300} height={90} className="mx-auto mb-4" priority />
          <h2 className="text-xl font-space-whale-body text-space-whale-navy mb-4">Space Whale Portal</h2>
          <p className="text-base font-space-whale-body text-space-whale-navy mb-6">Create, share, and connect.</p>
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
                    className="block w-full bg-gradient-to-r from-space-whale-purple to-accent-pink text-white font-space-whale-accent py-3 px-4 rounded-lg hover:from-space-whale-dark-purple hover:to-accent-pink/90 transition-all duration-300 shadow-lg"
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
                <h2 className="text-xl font-space-whale-heading text-space-whale-navy mb-2">Set New Password</h2>
                <p className="text-sm font-space-whale-body text-space-whale-navy/70">Enter your new password below.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 pr-12 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors font-space-whale-body"
                    placeholder="New Password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-space-whale-purple">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 pr-12 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors font-space-whale-body"
                    placeholder="Confirm New Password"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-space-whale-purple">
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-space-whale-purple to-accent-pink text-white font-space-whale-accent py-3 px-4 rounded-lg hover:from-space-whale-dark-purple hover:to-accent-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Updating Password...
                    </div>
                  ) : 'Update Password'}
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
