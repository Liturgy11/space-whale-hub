'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { User, Camera, Save, X } from 'lucide-react'

interface SimpleUserSettingsProps {
  onClose?: () => void
}

export default function SimpleUserSettings({ onClose }: SimpleUserSettingsProps) {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [pronouns, setPronouns] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarUpload = async (file: File) => {
    console.log('Uploading file:', file.name)
    // For now, just create a local URL
    const url = URL.createObjectURL(file)
    setAvatarUrl(url)
    setSuccess('Avatar updated! (Local preview)')
  }

  const handleSave = async () => {
    setSaving(true)
    console.log('Saving:', { displayName, pronouns, avatarUrl })
    
    // Simulate save
    setTimeout(() => {
      setSuccess('Profile saved! (Changes are temporary)')
      setSaving(false)
    }, 1000)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Avatar Section - ALWAYS VISIBLE */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
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
              className="absolute bottom-0 right-0 bg-purple-600 text-white rounded-full p-2 hover:bg-purple-700 transition-colors disabled:opacity-50"
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
          <p className="text-sm text-gray-600 mt-2">
            Click the camera icon to upload a profile picture
          </p>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Your display name"
            maxLength={50}
          />
        </div>

        {/* Pronouns */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pronouns
          </label>
          <input
            type="text"
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="e.g., they/them, she/her, he/him"
            maxLength={20}
          />
        </div>

        {/* Success Message */}
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
            className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
