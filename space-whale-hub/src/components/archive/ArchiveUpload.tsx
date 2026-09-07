'use client'

import { useState, useEffect } from 'react'
import { Upload, X, Image, Video, FileText, Music, Tag } from 'lucide-react'
// Removed direct database import - using secure API route instead
import { uploadMedia } from '@/lib/storage-client'
import { archiveContentType, formatBytes, isAllowedMedia, isVideoFile, SIZE_LIMITS, VIDEO_SOURCE_MAX } from '@/lib/media-types'
import { compressVideo } from '@/lib/compress-video'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/components/ui/Toast'
import { secureFetch } from '@/lib/secure-fetch'

interface ArchiveUploadProps {
  onUploadComplete?: () => void
}

export default function ArchiveUpload({ onUploadComplete }: ArchiveUploadProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
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
  const [albums, setAlbums] = useState<Array<{ id: string; title: string }>>([])
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('')

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true)
      let fileToUpload = file
      if (isVideoFile(file)) {
        fileToUpload = await compressVideo(file, {
          onStatus: setUploadStatus,
          onProgress: (ratio) => {
            if (ratio > 0 && ratio < 1) {
              setUploadStatus(`Compressing video… ${Math.round(ratio * 100)}%`)
            }
          },
        })
        if (fileToUpload.size > SIZE_LIMITS.archive) {
          throw new Error(
            `Even after compression this clip is ${formatBytes(fileToUpload.size)} (max ${formatBytes(SIZE_LIMITS.archive)}).`
          )
        }
      }
      setUploadStatus('Uploading…')
      const result = await uploadMedia(fileToUpload, {
        category: 'archive',
        filename: `${Date.now()}-${fileToUpload.name}`
      }, user!.id)
      return result.url
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    } finally {
      setUploading(false)
      setUploadStatus(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.upload_type === 'file' && !formData.file) {
      toast('Please select a file to upload', 'error')
      return
    }
    
    if (formData.upload_type === 'link' && !formData.media_url) {
      toast('Please enter a link to your content', 'error')
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
      
      // Create constellation item using secure API route
      const response = await secureFetch('/api/create-constellation-item-secure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          content_type: formData.content_type,
          media_url: mediaUrl,
          artist_name: formData.artist_name,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          user_id: user?.id
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to create constellation item')
      }

      // If admin selected an album, link the new item to that album
      if (user?.email === 'lizwamc@gmail.com' && selectedAlbumId) {
        try {
          await secureFetch('/api/manage-album-items-secure', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              album_id: selectedAlbumId,
              item_id: result.data.id,
              added_by: user?.id
            })
          })
        } catch (e) {
          console.error('Failed to add item to album:', e)
        }
      }
      
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
      setSelectedAlbumId('')
      
      setIsOpen(false)
      onUploadComplete?.()
      
    } catch (error: any) {
      console.error('Error creating archive item:', error)
      toast(error.message || 'Error uploading artwork. Please try again.', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!isAllowedMedia(file, 'archive')) {
        toast('Please upload an image, MP4/MOV video, audio, or PDF file', 'error')
        e.target.value = ''
        return
      }

      if (isVideoFile(file) && file.size > VIDEO_SOURCE_MAX) {
        toast(
          `Video too large to process (${formatBytes(file.size)}). Max source size is ${formatBytes(VIDEO_SOURCE_MAX)}.`,
          'error'
        )
        e.target.value = ''
        return
      }

      if (!isVideoFile(file) && file.size > SIZE_LIMITS.archive) {
        toast(
          `File is too large. Maximum is ${formatBytes(SIZE_LIMITS.archive)}. Your file is ${formatBytes(file.size)}.`,
          'error'
        )
        e.target.value = ''
        return
      }

      setFormData(prev => ({
        ...prev,
        file,
        content_type: archiveContentType(file),
      }))
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

  const isAdmin = user?.email === 'lizwamc@gmail.com'

  useEffect(() => {
    const loadAlbums = async () => {
      if (!isAdmin) return
      try {
        const res = await secureFetch('/api/get-albums-secure')
        const json = await res.json()
        if (json.success) {
          setAlbums((json.data || []).map((a: any) => ({ id: a.id, title: a.title })))
        }
      } catch (e) {
        console.error('Failed to load albums for upload:', e)
      }
    }
    loadAlbums()
  }, [isAdmin])

  return (
    <>
      {/* Upload Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center px-6 py-3 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white font-space-whale-accent rounded-full hover:from-space-whale-purple/90 hover:to-accent-pink/90 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <Upload className="h-5 w-5 mr-2" />
        Share
      </button>

      {/* Upload Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-gradient-to-br from-space-whale-lavender/90 to-space-whale-purple/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto rainbow-border-soft">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-space-whale-heading text-space-whale-navy">
                  Share
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-space-whale-purple hover:text-space-whale-navy transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Content Type */}
                <div>
                  <label className="block text-sm font-space-whale-accent text-space-whale-navy mb-3">
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
                            ? 'border-space-whale-purple bg-space-whale-lavender/20 text-space-whale-purple'
                            : 'border-space-whale-lavender/30 hover:border-space-whale-purple/50'
                        }`}
                      >
                        {type.icon}
                        <span className="ml-2 text-sm font-space-whale-body">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload Type Toggle */}
                <div>
                  <label className="block text-sm font-space-whale-accent text-space-whale-navy mb-3">
                    How would you like to share?
                  </label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, upload_type: 'file' }))}
                      className={`flex-1 flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                        formData.upload_type === 'file'
                          ? 'border-space-whale-purple bg-space-whale-lavender/20 text-space-whale-purple'
                          : 'border-space-whale-lavender/30 hover:border-space-whale-purple/50'
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
                          ? 'border-space-whale-purple bg-space-whale-lavender/20 text-space-whale-purple'
                          : 'border-space-whale-lavender/30 hover:border-space-whale-purple/50'
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
                    <label className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
                      Choose your file
                    </label>
                    <div className="border-2 border-dashed border-space-whale-lavender/30 rounded-lg p-6 text-center hover:border-space-whale-purple/50 transition-colors">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept={
                          formData.content_type === 'artwork' ? 'image/*' :
                          formData.content_type === 'video' ? 'video/mp4,video/webm,video/quicktime,.mp4,.mov,.webm' :
                          formData.content_type === 'audio' ? 'audio/*' :
                          'application/pdf'
                        }
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        {formData.file ? (
                          <div className="space-y-2">
                            <div className="text-space-whale-purple">
                              {getContentTypeIcon(formData.content_type)}
                            </div>
                            <p className="text-sm font-space-whale-body text-space-whale-navy">
                              {formData.file.name}
                            </p>
                            <p className="text-xs text-space-whale-navy/60 font-space-whale-body">
                              Click to change file
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="h-8 w-8 text-space-whale-purple/60 mx-auto" />
                            <p className="text-sm text-space-whale-navy/70 font-space-whale-body">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-space-whale-navy/50 font-space-whale-body">
                              {formData.content_type === 'artwork' ? `Images (JPG, PNG, GIF) - Max ${formatBytes(SIZE_LIMITS.archive)}` :
                               formData.content_type === 'video' ? `Videos (MP4, MOV) — 2–3 min readings auto-compress (source up to ${formatBytes(VIDEO_SOURCE_MAX)})` :
                               formData.content_type === 'audio' ? `Audio (MP3, WAV, M4A) - Max ${formatBytes(SIZE_LIMITS.archive)}` :
                               `PDF files - Max ${formatBytes(SIZE_LIMITS.archive)}`}
                            </p>
                            {uploadStatus && (
                              <p className="text-xs text-space-whale-purple mt-2 font-space-whale-body">
                                {uploadStatus}
                              </p>
                            )}
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
                      Share your link
                    </label>
                    <input
                      type="url"
                      value={formData.media_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, media_url: e.target.value }))}
                      placeholder="https://cloudflare.stream/your-video or https://youtube.com/watch?v=..."
                      className="w-full px-4 py-3 border border-space-whale-lavender/30 rounded-lg bg-white/80 backdrop-blur-sm text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent font-space-whale-body"
                      required
                    />
                    <p className="text-xs text-space-whale-navy/60 font-space-whale-body mt-1">
                      Perfect for large files! Share from Cloudflare Stream, YouTube, Vimeo, or any hosting platform.
                    </p>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="A title for your creation..."
                    className="w-full px-4 py-3 border border-space-whale-lavender/30 rounded-lg bg-white/80 backdrop-blur-sm text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent font-space-whale-body"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Tell us about it..."
                    rows={3}
                    className="w-full px-4 py-3 border border-space-whale-lavender/30 rounded-lg bg-white/80 backdrop-blur-sm text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent font-space-whale-body"
                  />
                </div>

                {/* Artist Name */}
                <div>
                  <label className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
                    Artist name (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.artist_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, artist_name: e.target.value }))}
                    placeholder="Your name"
                    className="w-full px-4 py-3 border border-space-whale-lavender/30 rounded-lg bg-white/80 backdrop-blur-sm text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent font-space-whale-body"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
                    <Tag className="h-4 w-4 inline mr-1" />
                    Tags (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="garden, cocoon, metamorphosis, whenua, cycles... (separated by commas)"
                    className="w-full px-4 py-3 border border-space-whale-lavender/30 rounded-lg bg-white/80 backdrop-blur-sm text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent font-space-whale-body"
                  />
                </div>

                {/* Admin-only: Select Album */}
                {isAdmin && (
                  <div>
                    <label className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
                      Add to album (admin)
                    </label>
                    <select
                      value={selectedAlbumId}
                      onChange={(e) => setSelectedAlbumId(e.target.value)}
                      className="w-full px-4 py-3 border border-space-whale-lavender/30 rounded-lg bg-white/80 backdrop-blur-sm text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent font-space-whale-body"
                    >
                      <option value="">— None —</option>
                      {albums.map(a => (
                        <option key={a.id} value={a.id}>{a.title}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-6 py-3 border border-space-whale-lavender/30 text-space-whale-navy rounded-lg hover:bg-space-whale-lavender/10 transition-colors font-space-whale-body"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || (formData.upload_type === 'file' && !formData.file) || (formData.upload_type === 'link' && !formData.media_url)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white font-space-whale-accent rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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
