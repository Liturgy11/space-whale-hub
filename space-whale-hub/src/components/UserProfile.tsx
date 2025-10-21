'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { User, ChevronDown } from 'lucide-react'
import SimpleAvatarUpload from './SimpleAvatarUpload'

export default function UserProfile() {
  const { user, signOut } = useAuth()
  const [showAvatarUpload, setShowAvatarUpload] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-space-whale-lavender/20 transition-colors group"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden shadow-lg group-hover:shadow-space-whale-purple/30 transition-all duration-300">
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-space-whale-purple to-accent-pink flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          )}
        </div>
        <span className="hidden md:block text-sm font-space-whale-accent text-space-whale-navy">
          {user.user_metadata?.display_name || 'Space Whale'}
        </span>
        <ChevronDown className="h-4 w-4 text-space-whale-navy" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-space-whale-lavender/20 z-50">
          <div className="py-1">
            <button
              onClick={() => {
                setShowAvatarUpload(true)
                setIsOpen(false)
              }}
              className="w-full text-left px-4 py-2 text-sm text-space-whale-navy hover:bg-space-whale-lavender/20 transition-colors"
            >
              Update Avatar
            </button>
            <button
              onClick={() => {
                signOut()
                setIsOpen(false)
              }}
              className="w-full text-left px-4 py-2 text-sm text-space-whale-navy hover:bg-space-whale-lavender/20 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Avatar Upload Modal */}
      {showAvatarUpload && (
        <SimpleAvatarUpload onClose={() => setShowAvatarUpload(false)} />
      )}
    </div>
  )
}
