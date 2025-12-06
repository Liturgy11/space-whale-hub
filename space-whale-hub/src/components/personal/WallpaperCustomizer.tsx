'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { uploadMedia } from '@/lib/storage-client'
import { toast } from '@/components/ui/Toast'
import { X, Palette, Upload, Sparkles, Leaf, Zap } from 'lucide-react'

interface WallpaperCustomizerProps {
  onClose: () => void
  onWallpaperChange: (wallpaper: string) => void
}

const presetWallpapers = [
  {
    id: 'garden',
    name: 'Garden Vibes',
    description: 'Soft greens, earth tones, and natural textures',
    gradient: 'from-green-100 via-emerald-50 to-teal-100',
    icon: <Leaf className="h-6 w-6" />
  },
  {
    id: 'cosmic',
    name: 'Cosmic Vibes',
    description: 'Deep space, nebulas, and cosmic energy',
    gradient: 'from-purple-900 via-indigo-800 to-blue-900',
    icon: <Sparkles className="h-6 w-6" />
  },
  {
    id: 'psychedelic',
    name: 'Psychedelic Vibes',
    description: 'Vibrant colors, flowing patterns, and trippy energy',
    gradient: 'from-pink-400 via-purple-500 to-indigo-600',
    icon: <Zap className="h-6 w-6" />
  },
  {
    id: 'minimal',
    name: 'Minimal Vibes',
    description: 'Clean, simple, and calming',
    gradient: 'from-gray-50 via-white to-gray-100',
    icon: <Palette className="h-6 w-6" />
  }
]

export default function WallpaperCustomizer({ onClose, onWallpaperChange }: WallpaperCustomizerProps) {
  const { user } = useAuth()
  const [selectedWallpaper, setSelectedWallpaper] = useState<string>('')
  const [customImage, setCustomImage] = useState<string>('')
  const [uploading, setUploading] = useState(false)

  const handlePresetSelect = (wallpaperId: string) => {
    setSelectedWallpaper(wallpaperId)
    setCustomImage('')
  }

  const handleCustomUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    if (!file.type.startsWith('image/')) {
      toast('Please select an image file', 'error')
      return
    }

    setUploading(true)
    try {
      console.log('Uploading custom wallpaper:', { fileName: file.name, fileSize: file.size, fileType: file.type })

      // Use new storage system instead of base64
      const result = await uploadMedia(file, {
        category: 'archive', // Using archive bucket for wallpapers
        filename: `${user.id}-wallpaper-${Date.now()}`
      }, user.id)

      console.log('Wallpaper uploaded to storage:', result.url)
      setCustomImage(result.url)
      setSelectedWallpaper('')
    } catch (error: any) {
      console.error('Error uploading custom wallpaper:', error)
      toast(`Upload failed: ${error.message}`, 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleApply = () => {
    if (selectedWallpaper) {
      onWallpaperChange(selectedWallpaper)
    } else if (customImage) {
      onWallpaperChange(customImage)
    }
    onClose()
  }

  const handleRevert = () => {
    onWallpaperChange('minimal')
    setSelectedWallpaper('')
    setCustomImage('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-lofi-card rounded-xl shadow-lg p-6 rainbow-border-soft max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-space-whale-heading text-space-whale-navy">Customize Your Space</h2>
          <button
            onClick={onClose}
            className="text-space-whale-purple hover:text-space-whale-navy transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Preset Wallpapers */}
          <div>
            <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-4">Choose a vibe</h3>
            <div className="grid grid-cols-2 gap-4">
              {presetWallpapers.map((wallpaper) => (
                <button
                  key={wallpaper.id}
                  onClick={() => handlePresetSelect(wallpaper.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedWallpaper === wallpaper.id
                      ? 'border-space-whale-purple bg-space-whale-lavender/20'
                      : 'border-space-whale-lavender/30 hover:border-space-whale-purple/50'
                  }`}
                >
                  <div className={`w-full h-20 rounded-lg mb-3 bg-gradient-to-br ${wallpaper.gradient} flex items-center justify-center`}>
                    <div className="text-white/80">
                      {wallpaper.icon}
                    </div>
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-space-whale-navy">{wallpaper.name}</h4>
                    <p className="text-sm text-space-whale-purple">{wallpaper.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Upload */}
          <div>
            <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-4">Or use your own art</h3>
            <div className="border-2 border-dashed border-space-whale-lavender/30 rounded-xl p-6 text-center hover:border-space-whale-purple/50 transition-colors">
              <Upload className="h-8 w-8 text-space-whale-purple mx-auto mb-3" />
              <p className="text-space-whale-navy mb-3">Upload your own artwork as wallpaper</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleCustomUpload}
                className="hidden"
                id="custom-wallpaper"
              />
              <label
                htmlFor="custom-wallpaper"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 transition-colors cursor-pointer"
              >
                {uploading ? 'Uploading...' : 'Choose Image'}
              </label>
            </div>
            
            {customImage && (
              <div className="mt-4">
                <p className="text-sm text-space-whale-purple mb-2">Preview:</p>
                <div className="w-full h-32 rounded-lg overflow-hidden">
                  <img
                    src={customImage}
                    alt="Custom wallpaper preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={handleRevert}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-space-whale-accent"
            >
              Revert to Default
            </button>
            <button
              onClick={handleApply}
              disabled={!selectedWallpaper && !customImage}
              className="px-6 py-3 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-space-whale-accent"
            >
              Apply Wallpaper
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

