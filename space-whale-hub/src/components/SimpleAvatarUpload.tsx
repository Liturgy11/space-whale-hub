'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { uploadMedia } from '@/lib/storage-client'
import { supabase } from '@/lib/supabase'
import { User, Camera, X, Upload } from 'lucide-react'

interface SimpleAvatarUploadProps {
  onClose?: () => void
}

export default function SimpleAvatarUpload({ onClose }: SimpleAvatarUploadProps) {
  const { user } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        // Set max dimensions
        const maxSize = 400
        let { width, height } = img
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            resolve(file)
          }
        }, 'image/jpeg', 0.8)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

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
      // Compress image to reduce size
      const compressedFile = await compressImage(file)
      
      // Create a unique filename with user ID
      const fileExt = 'jpg' // Always use jpg after compression
      const fileName = `${user.id}-avatar.${fileExt}`
      const filePath = `${user.id}/${fileName}`
      
      // Use new storage system instead of direct storage calls
      const result = await uploadMedia(compressedFile, {
        category: 'avatars',
        filename: `${user.id}-avatar`,
        upsert: true
      }, user.id)

      console.log('Avatar uploaded to storage:', result.url)
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
        setSuccess('✨ Avatar saved successfully! ✨')
      }
      
      setUploading(false)
    } catch (error) {
      console.error('Upload error:', error)
      setSuccess('❌ Upload failed. Please try again.')
      setUploading(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-lofi-card rounded-2xl shadow-2xl w-full max-w-sm mx-auto rainbow-border-soft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-space-whale-lavender/20">
          <h2 className="text-xl font-space-whale-heading text-space-whale-navy">Update Avatar</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-space-whale-purple hover:text-space-whale-dark-purple transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Avatar Preview */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-space-whale-lavender/20 to-space-whale-purple/20 flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-space-whale-purple" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 bg-space-whale-purple text-white rounded-full p-2 hover:bg-space-whale-dark-purple transition-colors disabled:opacity-50 shadow-lg hover:shadow-space-whale-purple/30"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm font-space-whale-body text-space-whale-navy mt-3">
              Click the camera icon to upload
            </p>
          </div>

          {/* Hidden file input */}
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

          {/* Status Messages */}
          {success && (
            <div className={`mb-4 p-3 rounded-lg text-sm font-space-whale-body ${
              success.includes('❌') 
                ? 'bg-red-50 text-red-600 border border-red-200' 
                : 'bg-gradient-to-r from-space-whale-lavender/20 to-accent-pink/20 text-space-whale-navy border border-space-whale-lavender/30'
            }`}>
              {success}
            </div>
          )}

          {uploading && (
            <div className="text-center mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-space-whale-purple mx-auto mb-2"></div>
              <p className="text-sm font-space-whale-body text-space-whale-navy">Uploading...</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-space-whale-navy hover:text-space-whale-purple transition-colors font-space-whale-accent"
              >
                Cancel
              </button>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center px-4 py-2 bg-space-whale-purple text-white rounded-lg hover:bg-space-whale-dark-purple disabled:opacity-50 transition-colors font-space-whale-accent shadow-lg hover:shadow-space-whale-purple/30"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
