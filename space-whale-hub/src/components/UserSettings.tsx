'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { uploadMedia } from '@/lib/storage-client'
import { supabase } from '@/lib/supabase'
import { User, Camera, X, Sparkles, Edit3, Save, Loader2 } from 'lucide-react'
import { toast } from '@/components/ui/Toast'

interface UserSettingsProps {
  onClose?: () => void
}

export default function UserSettings({ onClose }: UserSettingsProps) {
  const { user, updateProfile, refreshUser } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [pronouns, setPronouns] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize user data
  useEffect(() => {
    if (user) {
      setAvatarUrl(user.user_metadata?.avatar_url || '')
      setDisplayName(user.user_metadata?.display_name || '')
      setPronouns(user.user_metadata?.pronouns || '')
    }
  }, [user])

  const handleAvatarUpload = async (file: File) => {
    setUploading(true)
    setError('')
    setSuccess('')
    
    try {
      // Use new storage system
      const result = await uploadMedia(file, {
        category: 'avatars',
        filename: `${user.id}-avatar`,
        upsert: true
      }, user.id)
      const publicUrl = result.url
      const bustUrl = `${publicUrl}?v=${Date.now()}`

      // Update user metadata with new avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          ...user.user_metadata,
          avatar_url: bustUrl 
        }
      })

      if (updateError) {
        console.error('Profile update error:', updateError)
        setError('Avatar uploaded but profile update failed.')
        toast('Failed to update avatar', 'error')
      } else {
        setAvatarUrl(bustUrl)
        setSuccess('✨ Avatar updated successfully! ✨')
        toast('Avatar updated successfully!', 'success')
        // Ensure global auth user metadata reflects the new avatar
        await refreshUser()
        // Auto-close shortly after avatar success
        if (onClose) {
          setTimeout(() => onClose(), 800)
        }
      }
      
      setUploading(false)
    } catch (error) {
      console.error('Upload error:', error)
      setError('Upload failed. Please try again.')
      toast('Failed to upload avatar', 'error')
      setUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          ...user.user_metadata,
          display_name: displayName,
          pronouns: pronouns
        }
      })

      if (updateError) {
        setError('Failed to update profile. Please try again.')
        toast('Failed to update profile', 'error')
      } else {
        setSuccess('✨ Profile updated successfully! ✨')
        toast('Profile updated successfully!', 'success')
        await refreshUser()
        if (onClose) {
          setTimeout(() => onClose(), 800)
        }
      }
      
      setSaving(false)
    } catch (error) {
      console.error('Profile update error:', error)
      setError('Failed to update profile. Please try again.')
      toast('Failed to update profile', 'error')
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full border border-space-whale-lavender/20 bg-lofi-card rainbow-border-soft">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-space-whale-purple" />
          <h2 className="text-xl font-space-whale-heading text-space-whale-navy">Profile Settings</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-space-whale-purple hover:text-space-whale-dark-purple transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Avatar Section */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-space-whale-purple via-space-whale-lavender to-accent-pink flex items-center justify-center shadow-lg">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-white" />
              )}
            </div>
            <button
              onClick={() => {
                console.log('Camera button clicked')
                console.log('File input ref:', fileInputRef.current)
                fileInputRef.current?.click()
              }}
              disabled={uploading}
              className="absolute bottom-0 right-0 bg-space-whale-purple text-white rounded-full p-2 hover:bg-space-whale-dark-purple transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-space-whale-purple/30 min-w-[32px] min-h-[32px] flex items-center justify-center"
            >
              <Camera className="h-4 w-4" />
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
          <p className="text-xs font-space-whale-body text-space-whale-purple mt-1">
            Click camera icon to change avatar
          </p>
        </div>

        {/* Profile Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
              Cosmic Name *
            </label>
            <div className="relative">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors font-space-whale-body"
                placeholder="Your cosmic name"
              />
              <Edit3 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-space-whale-purple" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
              Pronouns (optional)
            </label>
            <input
              type="text"
              value={pronouns}
              onChange={(e) => setPronouns(e.target.value)}
              className="w-full px-4 py-3 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors font-space-whale-body"
              placeholder="e.g., they/them, she/her, he/him"
            />
          </div>

        </div>

        {/* Status Messages */}
        {success && (
          <div className="bg-gradient-to-r from-space-whale-lavender/20 to-accent-pink/20 border border-space-whale-lavender/30 rounded-lg p-4">
            <p className="text-space-whale-navy font-space-whale-body text-center">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm font-space-whale-body text-center">{error}</p>
          </div>
        )}

        {/* Upload Status */}
        {uploading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-space-whale-purple mx-auto mb-2"></div>
            <p className="text-space-whale-navy font-space-whale-body text-sm">Uploading your cosmic energy...</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-3">
          <button
            onClick={handleSaveProfile}
            disabled={saving || !displayName.trim()}
            className="btn-space-whale flex items-center"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="btn-space-whale-secondary"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}