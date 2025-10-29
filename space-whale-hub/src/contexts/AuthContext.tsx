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
      if (error) {
        console.error('Error getting session:', error)
        // Clear any invalid session data
        setSession(null)
        setUser(null)
      } else {
        setSession(session)
        setUser(session?.user ?? null)
        
        // Note: Profile creation handled in getPosts function due to RLS constraints
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id)
      setSession(session)
      setUser(session?.user ?? null)
      
      // Note: Profile creation handled in getPosts function due to RLS constraints
      
      setLoading(false)
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    // Clear local state
    setSession(null)
    setUser(null)
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
