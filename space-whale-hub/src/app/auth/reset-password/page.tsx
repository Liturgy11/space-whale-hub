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
  const [codeVerified, setCodeVerified] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { updatePassword } = useAuth()

  useEffect(() => {
    setMounted(true)
    
    // Supabase password reset links can come in two formats:
    // 1. Hash fragments (automatically processed) - e.g., #access_token=...
    // 2. Query parameters (need manual processing) - e.g., ?code=...
    const initializeReset = async () => {
      // #region agent log
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/760e5a7f-c1da-40b6-a7d0-e4cab2131118',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reset-password/page.tsx:32',message:'Reset password page initialized',data:{url:window.location.href,hash:window.location.hash,search:window.location.search,pathname:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      }
      // #endregion
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
      
      // Also check hash fragments for errors (Supabase redirects with hash fragments)
      let hashError = null
      let hashErrorCode = null
      let hashErrorDescription = null
      if (typeof window !== 'undefined' && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        hashError = hashParams.get('error')
        hashErrorCode = hashParams.get('error_code')
        hashErrorDescription = hashParams.get('error_description')
      }
      
      // Use hash fragment errors if present (they take precedence), otherwise use query params
      const finalError = hashError || errorParam
      const finalErrorCode = hashErrorCode || errorCode
      const finalErrorDescription = hashErrorDescription || errorDescription
      
      if (finalError || finalErrorCode) {
        console.log('Error detected in URL:', { 
          error: finalError, 
          errorCode: finalErrorCode, 
          errorDescription: finalErrorDescription,
          source: hashError ? 'hash' : 'query'
        })
        if (finalErrorCode === 'otp_expired') {
          setError('This reset link has expired. Password reset links are only valid for a limited time. Please request a new password reset email.')
        } else if (finalError === 'access_denied' || finalErrorCode === 'access_denied') {
          setError('Access denied. This reset link is invalid or has expired. Please request a new password reset email.')
        } else {
          setError(finalErrorDescription?.replace(/\+/g, ' ') || 'This reset link is invalid or has expired. Please request a new password reset email.')
        }
        setInitializing(false)
        return
      }

      // First, check if we already have a session
      let { data: { session } } = await supabase.auth.getSession()
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/760e5a7f-c1da-40b6-a7d0-e4cab2131118',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reset-password/page.tsx:79',message:'Initial session check',data:{hasSession:!!session,sessionUserId:session?.user?.id,accessToken:session?.access_token?.substring(0,20)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/760e5a7f-c1da-40b6-a7d0-e4cab2131118',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reset-password/page.tsx:93',message:'Hash fragment session check',data:{hasHashSession:!!hashSession,hash:typeof window !== 'undefined' ? window.location.hash : null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      if (hashSession) {
        console.log('Hash session found')
        setInitializing(false)
        return
      }

      // If no hash fragments, check for query parameters
      const code = searchParams.get('code')
      const type = searchParams.get('type')
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/760e5a7f-c1da-40b6-a7d0-e4cab2131118',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reset-password/page.tsx:100',message:'Query params check',data:{hasCode:!!code,hasType:!!type,codeLength:code?.length,typeValue:type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      console.log('Code from URL:', code)
      console.log('Type from URL:', type)
      
      if (!code && !type) {
        // No code in URL - invalid link
        console.log('No code or type found in URL')
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/760e5a7f-c1da-40b6-a7d0-e4cab2131118',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reset-password/page.tsx:107',message:'No code or type found - invalid link',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        setError('Invalid reset link. Please request a new password reset email.')
        setInitializing(false)
        return
      }

      // We have a code in query params
      // IMPORTANT: Supabase password reset emails should contain the full verification URL that goes
      // through Supabase's servers (https://[project].supabase.co/auth/v1/verify?...), which then
      // redirects to your app with hash fragments (#access_token=...).
      // 
      // If we're getting codes in query params directly, it means the email template might be using
      // {{ .Token }} or {{ .TokenHash }} instead of {{ .ConfirmationURL }}.
      // 
      // To fix this properly, check your Supabase email template:
      // 1. Go to Authentication > Email Templates > Reset Password
      // 2. Make sure the link uses: {{ .ConfirmationURL }}
      // 3. NOT: {{ .Token }} or {{ .TokenHash }}
      // 
      // For now, we'll try to handle codes by redirecting through Supabase's verification endpoint.
      
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
      
      // If we have a code in query params, try to verify it directly with verifyOtp
      // The code from Supabase password reset emails can be verified using verifyOtp
      if (code && typeof window !== 'undefined' && !codeVerified) {
        console.log('Code found in query params - attempting to verify')
        console.log('Full URL:', window.location.href)
        console.log('Code being used:', code.substring(0, 20) + '...')
        
        // IMPORTANT: Don't verify if we already have error parameters in the URL
        // This prevents infinite loops and ensures errors are shown on this page
        if (finalError || finalErrorCode) {
          console.log('Error already detected, not verifying code')
          // Error handling already done above, just return
          return
        }
        
        try {
          // Wait longer for Supabase's detectSessionInUrl to process the code automatically
          // Supabase with PKCE flow should automatically process codes in query params
          // Give it multiple chances to establish the session
          let sessionEstablished = false
          for (let attempt = 0; attempt < 5; attempt++) {
            await new Promise(resolve => setTimeout(resolve, 500))
            
            const { data: { session: checkSession } } = await supabase.auth.getSession()
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/760e5a7f-c1da-40b6-a7d0-e4cab2131118',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reset-password/page.tsx:175',message:'Waiting for auto-session establishment',data:{attempt:attempt+1,hasSession:!!checkSession},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            
            if (checkSession) {
              console.log('Session established automatically after', attempt + 1, 'attempts')
              sessionEstablished = true
              setCodeVerified(true)
              setInitializing(false)
              // Remove the code from URL to prevent re-verification
              if (window.history.replaceState) {
                const newUrl = new URL(window.location.href)
                newUrl.searchParams.delete('code')
                newUrl.searchParams.delete('type')
                window.history.replaceState({}, '', newUrl.toString())
              }
              return
            }
          }
          
          // If session still not established after waiting, try verifyOtp first
          // Since Supabase is generating direct links (bypassing verification endpoint),
          // we need to handle the code directly with verifyOtp
          if (!sessionEstablished) {
            console.log('Session not established automatically, trying verifyOtp with code')
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/760e5a7f-c1da-40b6-a7d0-e4cab2131118',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reset-password/page.tsx:200',message:'Attempting verifyOtp with code',data:{codeLength:code.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            
            // Mark as verified to prevent re-attempts
            setCodeVerified(true)
            
            // Try verifyOtp with the code as token_hash for recovery type
            // This is the recommended approach for direct links with codes
            const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
              token_hash: code,
              type: 'recovery'
            })
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/760e5a7f-c1da-40b6-a7d0-e4cab2131118',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reset-password/page.tsx:210',message:'verifyOtp result',data:{hasError:!!verifyError,errorMessage:verifyError?.message,hasData:!!verifyData,hasSession:!!verifyData?.session},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            
            if (verifyError) {
              console.error('Error verifying OTP:', verifyError)
              // If verifyOtp fails, try redirecting through verification endpoint as fallback
              console.log('verifyOtp failed, trying redirect through verification endpoint as fallback')
              const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrmdgbzmdtvqcuzfkwar.supabase.co'
              const redirectUrl = `${window.location.protocol}//${window.location.host}/auth/reset-password`
              const redirectTo = encodeURIComponent(redirectUrl)
              const verifyUrl = `${supabaseUrl}/auth/v1/verify?token=${encodeURIComponent(code)}&type=recovery&redirect_to=${redirectTo}`
              
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/760e5a7f-c1da-40b6-a7d0-e4cab2131118',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'reset-password/page.tsx:220',message:'Falling back to verification endpoint redirect',data:{verifyUrl,redirectUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
              // #endregion
              
              console.log('Redirecting to Supabase verification endpoint as fallback:', verifyUrl)
              window.location.href = verifyUrl
              return
            }
            
            // Check if session was established after verification
            const { data: { session: verifySession } } = await supabase.auth.getSession()
            if (verifySession) {
              console.log('Session established after verifyOtp')
              setInitializing(false)
              // Remove the code from URL to prevent re-verification
              if (window.history.replaceState) {
                const newUrl = new URL(window.location.href)
                newUrl.searchParams.delete('code')
                newUrl.searchParams.delete('type')
                window.history.replaceState({}, '', newUrl.toString())
              }
              return
            } else {
              console.error('No session after verifyOtp')
              setError('Failed to establish session. Please request a new password reset email.')
              setInitializing(false)
              return
            }
          }
        } catch (err) {
          console.error('Error verifying code:', err)
          setError('An error occurred while verifying the reset link. Please request a new password reset email.')
          setInitializing(false)
          return
        }
      } else if (codeVerified) {
        // Code already verified, just check for session
        const { data: { session: existingSession } } = await supabase.auth.getSession()
        if (existingSession) {
          setInitializing(false)
          return
        } else {
          // Session lost after verification - this shouldn't happen but handle gracefully
          setError('Session expired. Please request a new password reset email.')
          setInitializing(false)
          return
        }
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
  }, [searchParams, codeVerified]) // Add codeVerified to dependencies to prevent re-running if already verified

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
                  <p className="text-space-whale-navy/60 text-xs mt-3">
                    Note: If you've requested multiple reset emails recently, you may need to wait a few minutes before requesting another one.
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

