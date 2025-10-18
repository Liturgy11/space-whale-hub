'use client'

import { useState } from 'react'
import { Upload, X, Image, Video, FileText, Music, Tag } from 'lucide-react'
import { createArchiveItem } from '@/lib/database'
import { supabase } from '@/lib/supabase'

interface ArchiveUploadProps {
  onUploadComplete?: () => void
}

export default function ArchiveUpload({ onUploadComplete }: ArchiveUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: 'artwork' as 'video' | 'artwork' | 'zine' | 'audio',
    artist_name: '',
    tags: '',
    file: null as File | null,
    media_url: '',
    upload_type: 'file' as 'file' | 'link'
  })

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true)
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `archive/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('archive')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage
        .from('archive')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.upload_type === 'file' && !formData.file) {
      alert('Please select a file to upload')
      return
    }
    
    if (formData.upload_type === 'link' && !formData.media_url) {
      alert('Please enter a link to your content')
      return
    }

    try {
      setUploading(true)
      
      let mediaUrl = ''
      
      if (formData.upload_type === 'file') {
        // Upload file
        mediaUrl = await handleFileUpload(formData.file!)
      } else {
        // Use provided link
        mediaUrl = formData.media_url
      }
      
      // Create archive item
      await createArchiveItem({
        title: formData.title,
        description: formData.description,
        content_type: formData.content_type,
        media_url: mediaUrl,
        artist_name: formData.artist_name,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      })

      // Reset form
      setFormData({
        title: '',
        description: '',
        content_type: 'artwork',
        artist_name: '',
        tags: '',
        file: null,
        media_url: '',
        upload_type: 'file'
      })
      
      setIsOpen(false)
      onUploadComplete?.()
      
    } catch (error) {
      console.error('Error creating archive item:', error)
      alert('Error uploading artwork. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (50MB limit)
      const maxSize = 50 * 1024 * 1024 // 50MB in bytes
      if (file.size > maxSize) {
        alert(`File is too large. Maximum size is 50MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`)
        e.target.value = '' // Clear the input
        return
      }
      
      setFormData(prev => ({ ...prev, file }))
    }
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5" />
      case 'artwork': return <Image className="h-5 w-5" />
      case 'zine': return <FileText className="h-5 w-5" />
      case 'audio': return <Music className="h-5 w-5" />
      default: return <Image className="h-5 w-5" />
    }
  }

  return (
    <>
      {/* Upload Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <Upload className="h-5 w-5 mr-2" />
        Share
      </button>

      {/* Upload Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Share
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Content Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    What are you sharing?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'artwork', label: 'Artwork', icon: <Image className="h-4 w-4" /> },
                      { value: 'video', label: 'Video', icon: <Video className="h-4 w-4" /> },
                      { value: 'zine', label: 'Zine', icon: <FileText className="h-4 w-4" /> },
                      { value: 'audio', label: 'Audio', icon: <Music className="h-4 w-4" /> }
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, content_type: type.value as any }))}
                        className={`flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                          formData.content_type === type.value
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                      >
                        {type.icon}
                        <span className="ml-2 text-sm font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload Type Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    How would you like to share?
                  </label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, upload_type: 'file' }))}
                      className={`flex-1 flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                        formData.upload_type === 'file'
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, upload_type: 'link' }))}
                      className={`flex-1 flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                        formData.upload_type === 'link'
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <Tag className="h-4 w-4 mr-2" />
                      Share Link
                    </button>
                  </div>
                </div>

                {/* File Upload or Link Input */}
                {formData.upload_type === 'file' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Choose your file
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept={
                          formData.content_type === 'artwork' ? 'image/*' :
                          formData.content_type === 'video' ? 'video/*' :
                          formData.content_type === 'audio' ? 'audio/*' :
                          'application/pdf'
                        }
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        {formData.file ? (
                          <div className="space-y-2">
                            <div className="text-indigo-600 dark:text-indigo-400">
                              {getContentTypeIcon(formData.content_type)}
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formData.file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Click to change file
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {formData.content_type === 'artwork' ? 'Images (JPG, PNG, GIF) - Max 50MB' :
                               formData.content_type === 'video' ? 'Videos (MP4, MOV, AVI) - Max 50MB' :
                               formData.content_type === 'audio' ? 'Audio (MP3, WAV, M4A) - Max 50MB' :
                               'PDF files - Max 50MB'}
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Share your link
                    </label>
                    <input
                      type="url"
                      value={formData.media_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, media_url: e.target.value }))}
                      placeholder="https://cloudflare.stream/your-video or https://youtube.com/watch?v=..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      suppressHydrationWarning
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Perfect for large files! Share from Cloudflare Stream, YouTube, Vimeo, or any hosting platform.
                    </p>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="A title for your creation..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    suppressHydrationWarning
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tell us about it (optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What's the story behind this creation? What does it mean to you?"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    suppressHydrationWarning
                  />
                </div>

                {/* Artist Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Artist name (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.artist_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, artist_name: e.target.value }))}
                    placeholder="How would you like to be credited?"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    suppressHydrationWarning
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Tag className="h-4 w-4 inline mr-1" />
                    Tags (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="garden, cocoon, metamorphosis, whenua, cycles... (separated by commas)"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    suppressHydrationWarning
                  />
                </div>

                {/* Submit Button */}
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || (formData.upload_type === 'file' && !formData.file) || (formData.upload_type === 'link' && !formData.media_url)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {uploading ? 'Sharing...' : 'Share Your Harvest'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
