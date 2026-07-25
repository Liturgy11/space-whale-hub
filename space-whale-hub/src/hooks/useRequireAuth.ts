'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Redirects unauthenticated users to /auth without blocking the page shell.
 * Use this instead of ProtectedRoute when you want cached content to show immediately.
 */
export function useRequireAuth() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  return { user, loading, isAuthed: Boolean(user) }
}
