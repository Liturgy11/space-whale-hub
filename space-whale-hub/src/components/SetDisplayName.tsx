'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function SetDisplayName() {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState('Lit')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      const response = await fetch('/api/set-display-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ displayName }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        // Refresh the page to see the changes
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Error: ' + error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-4">
        <h2 className="text-xl font-space-whale-heading text-space-whale-navy mb-4">
          Set Your Display Name
        </h2>
        <p className="text-space-whale-purple mb-4">
          This will fix the "Space Whale" issue and show your actual name on posts.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 border border-space-whale-lavender/30 rounded-lg focus:ring-2 focus:ring-space-whale-purple focus:border-transparent"
              placeholder="Enter your display name"
              required
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white font-space-whale-accent py-2 px-4 rounded-lg hover:from-space-whale-dark-purple hover:to-accent-pink/90 disabled:opacity-50 transition-all duration-300"
            >
              {loading ? 'Setting...' : 'Set Display Name'}
            </button>
          </div>
        </form>

        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">
              ✅ Display name set successfully! Refreshing page...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
