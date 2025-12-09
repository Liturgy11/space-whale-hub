'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { uploadMedia } from '@/lib/storage-client'
import { supabase } from '@/lib/supabase'
import { User, Camera, X, Sparkles } from 'lucide-react'

interface AvatarUploadProps {
  onClose?: () => void
}

export default function AvatarUpload({ onClose }: AvatarUploadProps) {
  const { user } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize avatar URL from user metadata
  useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      setAvatarUrl(user.user_metadata.avatar_url)
    }
  }, [user])

  const handleAvatarUpload = async (file: File) => {
    // Validate file type (Android browsers sometimes return empty MIME types)
    const isValidMimeType = file.type.startsWith('image/')
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif']
    const isValidExtension = imageExtensions.includes(fileExtension)
    
    if (!isValidMimeType && !isValidExtension) {
      setSuccess('❌ Please upload an image file')
      return
    }

    setUploading(true)
    setSuccess('')
    
    try {
      // Use new storage system instead of direct storage calls
      const result = await uploadMedia(file, {
        category: 'avatars',
        filename: `${user.id}-avatar`,
        upsert: true
      }, user.id)
      const publicUrl = result.url

      // Update user metadata with new avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          ...user.user_metadata,
          avatar_url: publicUrl 
        }
      })

      if (updateError) {
        console.error('Update error:', updateError)
        setSuccess('❌ Avatar uploaded but profile update failed.')
      } else {
        setAvatarUrl(publicUrl)
        setSuccess('✨ Avatar updated successfully! ✨')
      }
      
      setUploading(false)
    } catch (error) {
      console.error('Upload error:', error)
      setSuccess('❌ Upload failed. Please try again.')
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto border border-space-whale-lavender/20 bg-lofi-card rainbow-border-soft">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-space-whale-purple" />
          <h2 className="text-xl font-space-whale-heading text-space-whale-navy">Update Avatar</h2>
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

      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-space-whale-purple via-space-whale-lavender to-accent-pink flex items-center justify-center shadow-lg">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-16 w-16 text-white" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-2 right-2 bg-space-whale-purple text-white rounded-full p-3 hover:bg-space-whale-dark-purple transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-space-whale-purple/30"
            >
              <Camera className="h-5 w-5" />
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
          <p className="text-sm font-space-whale-body text-space-whale-navy mt-3">
            Click the camera icon to upload your cosmic avatar
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-gradient-to-r from-space-whale-lavender/20 to-accent-pink/20 border border-space-whale-lavender/30 rounded-lg p-4">
            <p className="text-space-whale-navy font-space-whale-body text-center">{success}</p>
          </div>
        )}

        {/* Upload Status */}
        {uploading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-space-whale-purple mx-auto mb-2"></div>
            <p className="text-space-whale-navy font-space-whale-body">Uploading your cosmic energy...</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white text-space-whale-navy rounded-lg border border-space-whale-lavender/30 hover:bg-space-whale-lavender/10 transition-all duration-300 font-space-whale-accent"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
