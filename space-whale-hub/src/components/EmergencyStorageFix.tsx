'use client'

import { useEffect } from 'react'
import { emergencyStorageCleanup, forceStorageCleanup } from '@/lib/storage-fix'

export default function EmergencyStorageFix() {
  useEffect(() => {
    // Run emergency cleanup immediately on component mount
    const runCleanup = () => {
      try {
        // Check if localStorage is accessible
        localStorage.getItem('test')
        // Use force cleanup to be more aggressive
        forceStorageCleanup()
        console.log('Force storage cleanup completed')
      } catch (error) {
        console.error('Emergency cleanup failed:', error)
        // If localStorage is completely broken, try to clear it anyway
        try {
          localStorage.clear()
          sessionStorage.clear()
        } catch (clearError) {
          console.error('Even clearing failed:', clearError)
        }
      }
    }

    // Run immediately
    runCleanup()

    // Also run on any storage error
    const handleStorageError = (event: StorageEvent) => {
      if (event.key === null && event.newValue === null) {
        // This indicates a quota exceeded error
        console.log('Storage quota exceeded detected, running cleanup')
        forceStorageCleanup()
      }
    }

    // Global error handler for quota exceeded
    const handleGlobalError = (event: ErrorEvent) => {
      if (event.message && event.message.includes('quota exceeded')) {
        console.log('Quota exceeded error detected, running cleanup')
        forceStorageCleanup()
      }
    }

    window.addEventListener('storage', handleStorageError)
    window.addEventListener('error', handleGlobalError)

    return () => {
      window.removeEventListener('storage', handleStorageError)
      window.removeEventListener('error', handleGlobalError)
    }
  }, [])

  return null // This component doesn't render anything
}
