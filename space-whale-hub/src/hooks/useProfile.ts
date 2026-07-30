'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { secureFetch, parseSecureResponse } from '@/lib/secure-fetch'

export type UserProfileRow = {
  id: string
  display_name: string | null
  pronouns: string | null
  country: string | null
  bio: string | null
  avatar_url: string | null
  welcome_seen_at: string | null
  first_post_ack_at: string | null
}

/** Load profile from profiles table (source of truth), with auth metadata fallback. */
export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfileRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const reloadProfile = useCallback(() => setReloadKey((k) => k + 1), [])

  useEffect(() => {
    if (!user) {
      setProfile(null)
      return
    }

    let cancelled = false
    setLoading(true)

    ;(async () => {
      try {
        const res = await secureFetch('/api/get-profile-secure')
        const result = await parseSecureResponse<{ success: boolean; data: UserProfileRow | null }>(res)
        if (cancelled) return

        if (result.success && result.data) {
          setProfile(result.data)
        } else {
          setProfile({
            id: user.id,
            display_name: user.user_metadata?.display_name ?? null,
            pronouns: user.user_metadata?.pronouns ?? null,
            country: user.user_metadata?.country ?? null,
            bio: null,
            avatar_url: user.user_metadata?.avatar_url ?? null,
            welcome_seen_at: null,
            first_post_ack_at: null,
          })
        }
      } catch {
        if (!cancelled) {
          setProfile({
            id: user.id,
            display_name: user.user_metadata?.display_name ?? null,
            pronouns: user.user_metadata?.pronouns ?? null,
            country: user.user_metadata?.country ?? null,
            bio: null,
            avatar_url: user.user_metadata?.avatar_url ?? null,
            welcome_seen_at: null,
            first_post_ack_at: null,
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user, reloadKey])

  return { profile, loading, reloadProfile }
}
