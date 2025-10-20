'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { User, Camera, Save, Loader2, X } from 'lucide-react'

interface UserSettingsProps {
  onClose?: () => void
}

export default function UserSettings({ onClose }: UserSettingsProps) {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [pronouns, setPronouns] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      loadUserProfile()
    } else {
      // If no user, just set loading to false
      setLoading(false)
    }
  }, [user])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      console.log('Loading profile for user:', user?.id)
      
      // For now, just use auth user data instead of profiles table
      setDisplayName(user?.user_metadata?.display_name || '')
      setPronouns(user?.user_metadata?.pronouns || '')
      setAvatarUrl(user?.user_metadata?.avatar_url || '')
      
    } catch (err: any) {
      console.error('Error loading profile:', err)
      // Use defaults
      setDisplayName('')
      setPronouns('')
      setAvatarUrl('')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (file: File) => {
    if (!user) return

    try {
      setSaving(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(data.publicUrl)
      setSuccess('Avatar updated!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      // For now, just update the local state and show success
      // TODO: In the future, we can implement proper profile storage
      console.log('Saving profile:', {
        displayName: displayName.trim(),
        pronouns: pronouns.trim(),
        avatarUrl
      })

      setSuccess('Profile updated successfully! (Note: Changes are temporary for now)')
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        if (onClose) onClose()
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-space-whale-purple" />
        <span className="ml-3 text-space-whale-navy font-space-whale-body">Loading profile...</span>
      </div>
    )
  }

  console.log('UserSettings rendering:', { loading, user, avatarUrl, displayName, pronouns })

  return (
    <div className="bg-lofi-card rounded-xl shadow-lg p-6 rainbow-border-soft max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-space-whale-heading text-space-whale-navy">Profile Settings</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-space-whale-purple hover:text-space-whale-navy transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-space-whale-purple to-accent-pink flex items-center justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-white" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
              className="absolute bottom-0 right-0 bg-space-whale-purple text-white rounded-full p-2 hover:bg-space-whale-purple/90 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleAvatarUpload(e.target.files[0])
              }
            }}
            className="hidden"
          />
          <p className="text-sm text-space-whale-purple mt-2 font-space-whale-body">
            Click the camera icon to upload a profile picture
          </p>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-space-whale-navy mb-2 font-space-whale-body">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors"
            placeholder="Your display name"
            maxLength={50}
          />
        </div>

        {/* Pronouns */}
        <div>
          <label className="block text-sm font-medium text-space-whale-navy mb-2 font-space-whale-body">
            Pronouns
          </label>
          <input
            type="text"
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
            className="w-full px-4 py-3 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors"
            placeholder="e.g., they/them, she/her, he/him"
            maxLength={20}
          />
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-space-whale-accent"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
