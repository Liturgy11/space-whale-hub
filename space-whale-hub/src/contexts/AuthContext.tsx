'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  updatePassword: (newPassword: string) => Promise<{ error: any }>
  updateProfile: (updates: { display_name?: string; pronouns?: string; bio?: string }) => Promise<{ error: any }>
  clearInvalidSession: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to ensure user has a profile
async function ensureUserProfile(user: User) {
  try {
    console.log('Ensuring profile for user:', user.email)
    
    // Determine the best display name
    let displayName = 'Space Whale' // fallback
    
    // Special case for Lit - prioritize "Lit" as the cosmic name
    if (user.email === 'lizwamc@gmail.com') {
      displayName = 'Lit'
    } else {
      // For other users, use their metadata or email prefix
      displayName = user.user_metadata?.display_name || 
                   user.email?.split('@')[0] || 
                   'Space Whale'
    }

    console.log('Display name determined:', displayName)

    // First, check if profile exists
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('id', user.id)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is expected if profile doesn't exist
      console.error('Error checking existing profile:', selectError)
    }

    if (!existingProfile) {
      // Profile doesn't exist, create it
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          display_name: displayName
        })
      
      if (insertError) {
        console.error('Error inserting profile:', insertError)
      } else {
        console.log('Successfully created profile for user:', displayName)
      }
    } else if (existingProfile.display_name !== displayName) {
      // Profile exists but name is wrong, update it
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id)
      
      if (updateError) {
        console.error('Error updating profile:', updateError)
      } else {
        console.log('Successfully updated profile for user:', displayName)
      }
    } else {
      console.log('Profile already exists with correct name:', displayName)
    }
  } catch (error) {
    console.error('Error ensuring user profile:', error)
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      // #region agent log
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/760e5a7f-c1da-40b6-a7d0-e4cab2131118',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:96',message:'AuthContext initial session check',data:{hasSession:!!session,hasError:!!error,errorMessage:error?.message,pathname:window.location.pathname,hash:window.location.hash.substring(0,50)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      }
      // #endregion
      if (error) {
        // Handle invalid refresh token - clear session and let user sign in again
        if (error.message?.includes('Invalid Refresh Token') || 
            error.message?.includes('Refresh Token Not Found') ||
            error.name === 'AuthApiError' && error.message?.includes('refresh_token')) {
          console.warn('Invalid refresh token detected, clearing session:', error.message)
          // Clear invalid session
          await supabase.auth.signOut()
          setSession(null)
          setUser(null)
        } else if (error.name === 'AuthRetryableFetchError') {
          console.warn('Network error during auth initialization, will retry:', error.message)
          // Don't clear session on retryable errors - Supabase will handle retries
          // Try to use cached session if available
          try {
            const cachedSession = await supabase.auth.getSession()
            if (cachedSession.data.session) {
              setSession(cachedSession.data.session)
              setUser(cachedSession.data.session.user)
            }
          } catch (e) {
            // Ignore cache errors
          }
        } else {
          console.error('Error getting session:', error)
          // Clear any invalid session data for non-retryable errors
          setSession(null)
          setUser(null)
        }
      } else {
        setSession(session)
        setUser(session?.user ?? null)
        
        // Note: Profile creation handled in getPosts function due to RLS constraints
      }
      setLoading(false)
    }).catch((err) => {
      // Catch any unexpected errors
      console.warn('Unexpected error during session fetch:', err)
      // If it's an invalid token error, clear the session
      if (err?.message?.includes('Invalid Refresh Token') || 
          err?.message?.includes('Refresh Token Not Found')) {
        supabase.auth.signOut()
        setSession(null)
        setUser(null)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // #region agent log
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/760e5a7f-c1da-40b6-a7d0-e4cab2131118',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:149',message:'Auth state change event',data:{event,hasSession:!!session,pathname:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      }
      // #endregion
      
      // If this is a password recovery event and we're not on the reset password page, redirect there
      if (event === 'PASSWORD_RECOVERY' && session && typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        if (currentPath !== '/auth/reset-password') {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/760e5a7f-c1da-40b6-a7d0-e4cab2131118',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:156',message:'PASSWORD_RECOVERY event detected - redirecting to reset-password page',data:{currentPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          // Preserve hash fragments and query params
          const resetUrl = new URL('/auth/reset-password', window.location.origin)
          resetUrl.hash = window.location.hash
          resetUrl.search = window.location.search
          window.location.href = resetUrl.toString()
          return // Don't update state yet, let the redirect happen
        }
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      
      // Note: Profile creation handled in getPosts function due to RLS constraints
      
      setLoading(false)
    }, (error) => {
      // Handle auth state change errors
      if (error?.message?.includes('Invalid Refresh Token') || 
          error?.message?.includes('Refresh Token Not Found')) {
        // Clear invalid session on refresh token errors
        console.warn('Invalid refresh token in auth state change, clearing session')
        supabase.auth.signOut()
        setSession(null)
        setUser(null)
      } else if (error?.name === 'AuthRetryableFetchError' || error?.message?.includes('Load failed')) {
        // Suppress retryable errors - they'll retry automatically
        // These are network issues that Supabase will handle
        return
      } else {
        console.error('Auth state change error:', error)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, displayName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    })

    // Note: Profile creation handled in getPosts function due to RLS constraints

    return { error }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (err: any) {
      // Handle network errors
      console.error('Sign in error:', err)
      return { 
        error: { 
          message: err.message || 'Network error. Please check your connection and try again.',
          name: err.name 
        } 
      }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    // Clear local state
    setSession(null)
    setUser(null)
  }

  const resetPassword = async (email: string) => {
    try {
      // Use the current origin (works for both localhost and production)
      // IMPORTANT: This must match EXACTLY what's in Supabase's allowed redirect URLs
      // (including protocol, host, port, path - no trailing slashes)
      const redirectUrl = `${window.location.protocol}//${window.location.host}/auth/reset-password`
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/760e5a7f-c1da-40b6-a7d0-e4cab2131118',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:222',message:'resetPassword called',data:{email,redirectUrl,origin:window.location.origin,protocol:window.location.protocol,host:window.location.host},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/760e5a7f-c1da-40b6-a7d0-e4cab2131118',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:226',message:'resetPassword result',data:{hasError:!!error,errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return { error }
    } catch (err: any) {
      console.error('Reset password error:', err)
      return { 
        error: { 
          message: err.message || 'Failed to send password reset email. Please try again.',
          name: err.name 
        } 
      }
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      return { error }
    } catch (err: any) {
      console.error('Update password error:', err)
      return { 
        error: { 
          message: err.message || 'Failed to update password. Please try again.',
          name: err.name 
        } 
      }
    }
  }

  const clearInvalidSession = async () => {
    // Clear any invalid session data from localStorage
    localStorage.removeItem('sb-qrmdgbzmdtvqcuzfkwar-auth-token')
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const { data, error } = await supabase.auth.getUser()
      if (!error) {
        setUser(data.user ?? null)
      }
    } catch (_e) {
      // ignore
    }
  }

  const updateProfile = async (updates: { display_name?: string; pronouns?: string; bio?: string }) => {
    if (!user) return { error: new Error('No user logged in') }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    clearInvalidSession,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
