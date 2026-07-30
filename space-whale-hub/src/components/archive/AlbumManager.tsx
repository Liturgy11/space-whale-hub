'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, Edit3, Trash2, Calendar, MapPin, FolderOpen, Upload, X, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { uploadMedia } from '@/lib/storage-client'
import { toast } from '@/components/ui/Toast'
import EmptyState, { SpaceIllustration } from '@/components/ui/EmptyState'
import { SPACE_ILLUSTRATIONS } from '@/lib/space-illustrations'
import { secureFetch, parseSecureResponse } from '@/lib/secure-fetch'

interface Album {
  id: string
  title: string
  description?: string
  cover_image_url?: string
  event_date?: string
  event_location?: string
  created_by: string
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
  item_count: number
}

export default function AlbumManager() {
  const { user } = useAuth()
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null)
  const [showBatchUpload, setShowBatchUpload] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [showCoverUrlFallback, setShowCoverUrlFallback] = useState(false)
  const [pendingGalleryFiles, setPendingGalleryFiles] = useState<File[]>([])
  const coverInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const [newAlbum, setNewAlbum] = useState({
    title: '',
    description: '',
    cover_image_url: '',
    event_date: '',
    event_location: '',
    is_featured: false,
    sort_order: 0
  })

  const resetForm = useCallback(() => {
    if (coverPreview) URL.revokeObjectURL(coverPreview)
    setCoverFile(null)
    setCoverPreview(null)
    setShowCoverUrlFallback(false)
    setPendingGalleryFiles([])
    setNewAlbum({
      title: '',
      description: '',
      cover_image_url: '',
      event_date: '',
      event_location: '',
      is_featured: false,
      sort_order: 0
    })
  }, [coverPreview])

  const uploadCoverImage = async (file: File): Promise<string> => {
    const uploadResult = await uploadMedia(file, {
      category: 'archive',
      filename: `cover-${Date.now()}-${file.name}`
    }, 'archive-uploads')
    return uploadResult.url
  }

  const uploadFilesToAlbum = async (
    files: File[] | FileList,
    album: Album,
    onProgress?: (current: number, total: number) => void
  ): Promise<number> => {
    if (!user) return 0

    const fileArray = Array.from(files)
    for (let index = 0; index < fileArray.length; index++) {
      const file = fileArray[index]
      onProgress?.(index + 1, fileArray.length)

      const uploadResult = await uploadMedia(file, {
        category: 'archive',
        filename: `${Date.now()}-${index}-${file.name}`
      }, 'archive-uploads')

      const itemResponse = await secureFetch('/api/create-constellation-item-secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: file.name.replace(/\.[^/.]+$/, ''),
          description: `Uploaded to ${album.title}`,
          content_type: file.type.startsWith('image/') ? 'artwork'
            : file.type.startsWith('video/') ? 'video' : 'artwork',
          media_url: uploadResult.url,
          artist_name: '',
          tags: [album.title.toLowerCase().replace(/\s+/g, '-')],
          user_id: user.id
        })
      })
      const itemResult = await parseSecureResponse<{ success: boolean; data: { id: string }; error?: string }>(itemResponse)
      if (!itemResult.success) {
        throw new Error(itemResult.error || 'Failed to create archive item')
      }

      const albumResponse = await secureFetch('/api/manage-album-items-secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          album_id: album.id,
          item_id: itemResult.data.id,
          added_by: user.id
        })
      })
      const albumResult = await parseSecureResponse<{ success: boolean; error?: string }>(albumResponse)
      if (!albumResult.success) {
        throw new Error(albumResult.error || 'Failed to add item to album')
      }
    }

    return fileArray.length
  }

  const handleCoverFileSelect = (file: File | null) => {
    if (coverPreview) URL.revokeObjectURL(coverPreview)
    if (!file) {
      setCoverFile(null)
      setCoverPreview(null)
      return
    }
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
    setNewAlbum(prev => ({ ...prev, cover_image_url: '' }))
  }

  const handleGalleryFilesSelect = (files: FileList | null) => {
    if (!files?.length) return
    setPendingGalleryFiles(prev => [...prev, ...Array.from(files)])
  }

  const removePendingGalleryFile = (index: number) => {
    setPendingGalleryFiles(prev => prev.filter((_, i) => i !== index))
  }

  const loadAlbums = async () => {
    try {
      setLoading(true)
      const response = await secureFetch('/api/get-albums-secure')
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch albums')
      }

      setAlbums(result.data || [])
    } catch (error) {
      console.error('Error fetching albums:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast('Please sign in to create an album.', 'error')
      return
    }

    if (!newAlbum.title.trim()) {
      toast('Album title is required.', 'error')
      titleInputRef.current?.focus()
      titleInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)
    try {
      let coverImageUrl = newAlbum.cover_image_url.trim() || null
      if (coverFile) {
        setSubmitStatus('Uploading cover…')
        coverImageUrl = await uploadCoverImage(coverFile)
      }

      setSubmitStatus('Creating album…')
      const response = await secureFetch('/api/create-album-secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAlbum,
          cover_image_url: coverImageUrl,
          created_by: user.id
        })
      })

      const result = await parseSecureResponse<{ success: boolean; data: Album; error?: string }>(response)
      if (!result.success) {
        throw new Error(result.error || 'Failed to create album')
      }

      const createdAlbum: Album = { ...result.data, item_count: 0 }

      if (pendingGalleryFiles.length > 0) {
        const count = await uploadFilesToAlbum(
          pendingGalleryFiles,
          createdAlbum,
          (current, total) => setSubmitStatus(`Uploading photos (${current}/${total})…`)
        )
        toast(`Album created with ${count} photo${count === 1 ? '' : 's'}!`, 'success')
      } else {
        toast('Album created! Add photos below.', 'success')
        setSelectedAlbum(createdAlbum)
        setShowBatchUpload(true)
      }

      resetForm()
      setIsCreating(false)
      loadAlbums()
    } catch (error: unknown) {
      console.error('Error creating album:', error)
      const message = error instanceof Error ? error.message : 'Failed to create album. Please try again.'
      if (message.toLowerCase().includes('authorization') || message.toLowerCase().includes('unauthorized') || message.toLowerCase().includes('invalid or expired token') || message.toLowerCase().includes('missing or invalid authorization')) {
        toast('Could not verify your session. Try refreshing the page, or sign out and back in.', 'error')
      } else {
        toast(message, 'error')
      }
    } finally {
      setIsSubmitting(false)
      setSubmitStatus(null)
    }
  }

  const handleEditAlbum = (album: Album) => {
    resetForm()
    setEditingAlbum(album)
    setNewAlbum({
      title: album.title,
      description: album.description || '',
      cover_image_url: album.cover_image_url || '',
      event_date: album.event_date || '',
      event_location: album.event_location || '',
      is_featured: album.is_featured,
      sort_order: album.sort_order
    })
  }

  const handleUpdateAlbum = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAlbum || !user) {
      toast('Please sign in to update this album.', 'error')
      return
    }

    if (!newAlbum.title.trim()) {
      toast('Album title is required.', 'error')
      titleInputRef.current?.focus()
      titleInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)
    try {
      let coverImageUrl = newAlbum.cover_image_url.trim() || null
      if (coverFile) {
        setSubmitStatus('Uploading cover…')
        coverImageUrl = await uploadCoverImage(coverFile)
      }

      setSubmitStatus('Saving album…')
      const response = await secureFetch('/api/update-album-secure', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAlbum.id,
          ...newAlbum,
          cover_image_url: coverImageUrl
        })
      })

      const result = await parseSecureResponse<{ success: boolean; error?: string }>(response)
      if (!result.success) {
        throw new Error(result.error || 'Failed to update album')
      }

      const updatedAlbum: Album = { ...editingAlbum, ...newAlbum, cover_image_url: coverImageUrl || undefined }

      if (pendingGalleryFiles.length > 0) {
        const count = await uploadFilesToAlbum(
          pendingGalleryFiles,
          updatedAlbum,
          (current, total) => setSubmitStatus(`Uploading photos (${current}/${total})…`)
        )
        toast(`Album updated with ${count} new photo${count === 1 ? '' : 's'}!`, 'success')
      } else {
        toast('Album updated!', 'success')
      }

      setEditingAlbum(null)
      resetForm()
      loadAlbums()
    } catch (error: unknown) {
      console.error('Error updating album:', error)
      const message = error instanceof Error ? error.message : 'Failed to update album. Please try again.'
      if (message.toLowerCase().includes('authorization') || message.toLowerCase().includes('unauthorized') || message.toLowerCase().includes('invalid or expired token') || message.toLowerCase().includes('missing or invalid authorization')) {
        toast('Could not verify your session. Try refreshing the page, or sign out and back in.', 'error')
      } else {
        toast(message, 'error')
      }
    } finally {
      setIsSubmitting(false)
      setSubmitStatus(null)
    }
  }

  const handleDeleteAlbum = async (album: Album) => {
    if (!confirm(`Are you sure you want to delete "${album.title}"? This will also remove all items from the album.`)) {
      return
    }

    try {
      const response = await secureFetch('/api/update-album-secure', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: album.id })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete album')
      }

      loadAlbums()
    } catch (error: any) {
      console.error('Error deleting album:', error)
      toast(error.message || 'Failed to delete album. Please try again.', 'error')
    }
  }

  const handleBatchUpload = async (files: FileList) => {
    if (!selectedAlbum || !user) return

    setUploadingFiles(true)
    try {
      const count = await uploadFilesToAlbum(files, selectedAlbum)
      setShowBatchUpload(false)
      setSelectedAlbum(null)
      loadAlbums()
      toast(`Successfully uploaded ${count} file${count === 1 ? '' : 's'} to ${selectedAlbum.title}!`, 'success')
    } catch (error: unknown) {
      console.error('Error batch uploading:', error)
      const message = error instanceof Error ? error.message : 'Failed to upload files. Please try again.'
      toast(message, 'error')
    } finally {
      setUploadingFiles(false)
    }
  }

  useEffect(() => {
    loadAlbums()
  }, [])

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview)
    }
  }, [coverPreview])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <SpaceIllustration
            src={SPACE_ILLUSTRATIONS.constellation}
            className="h-12 w-12 mx-auto mb-3 animate-float"
          />
          <p className="text-space-whale-navy/70 font-space-whale-body">Loading albums...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-space-whale-heading text-space-whale-navy mb-2">
            Album Management
          </h2>
          <p className="text-space-whale-navy/70 font-space-whale-body">
            Create and manage curated collections for events and projects
          </p>
        </div>
        <button
          onClick={() => {
            setEditingAlbum(null)
            resetForm()
            setIsCreating(true)
          }}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 transition-all duration-300 font-space-whale-accent"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Album
        </button>
      </div>

      {/* Create/Edit Album Form */}
      {(isCreating || editingAlbum) && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-space-whale-lavender/20">
          <h3 className="text-lg font-space-whale-heading text-space-whale-navy mb-4">
            {editingAlbum ? 'Edit Album' : 'Create New Album'}
          </h3>
          <form
            onSubmit={editingAlbum ? handleUpdateAlbum : handleCreateAlbum}
            noValidate
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
                  Album Title *
                </label>
                <input
                  ref={titleInputRef}
                  type="text"
                  value={newAlbum.title}
                  onChange={(e) => setNewAlbum(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Pride Poetry - Coastal Twist Festival"
                  className="w-full px-3 py-2 border border-space-whale-lavender/30 rounded-lg focus:ring-2 focus:ring-space-whale-purple focus:border-transparent font-space-whale-body"
                  aria-required="true"
                />
              </div>
              <div>
                <label className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
                  Event Date
                </label>
                <input
                  type="date"
                  value={newAlbum.event_date}
                  onChange={(e) => setNewAlbum(prev => ({ ...prev, event_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-space-whale-lavender/30 rounded-lg focus:ring-2 focus:ring-space-whale-purple focus:border-transparent font-space-whale-body"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
                Description
              </label>
              <textarea
                value={newAlbum.description}
                onChange={(e) => setNewAlbum(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this collection..."
                rows={3}
                className="w-full px-3 py-2 border border-space-whale-lavender/30 rounded-lg focus:ring-2 focus:ring-space-whale-purple focus:border-transparent font-space-whale-body"
              />
            </div>

            <div>
              <label className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
                Event Location
              </label>
              <input
                type="text"
                value={newAlbum.event_location}
                onChange={(e) => setNewAlbum(prev => ({ ...prev, event_location: e.target.value }))}
                placeholder="e.g., Pearl Beach Arboretum"
                className="w-full px-3 py-2 border border-space-whale-lavender/30 rounded-lg focus:ring-2 focus:ring-space-whale-purple focus:border-transparent font-space-whale-body"
              />
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
                Cover Image
              </label>
              {(coverPreview || newAlbum.cover_image_url) ? (
                <div className="relative inline-block mb-3">
                  <img
                    src={coverPreview || newAlbum.cover_image_url}
                    alt="Cover preview"
                    className="h-32 w-auto max-w-full rounded-lg object-cover border border-space-whale-lavender/30"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleCoverFileSelect(null)
                      setNewAlbum(prev => ({ ...prev, cover_image_url: '' }))
                    }}
                    className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow border border-space-whale-lavender/30 text-space-whale-navy hover:text-red-600"
                    aria-label="Remove cover image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-space-whale-lavender/30 rounded-lg p-6 text-center hover:border-space-whale-purple/50 transition-colors cursor-pointer mb-3"
                  onClick={() => coverInputRef.current?.click()}
                >
                  <ImageIcon className="h-8 w-8 text-space-whale-purple/60 mx-auto mb-2" />
                  <p className="text-sm font-space-whale-body text-space-whale-navy">
                    Click to upload a cover image
                  </p>
                  <p className="text-xs text-space-whale-navy/60 font-space-whale-body mt-1">
                    JPG, PNG, or WebP
                  </p>
                </div>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleCoverFileSelect(e.target.files?.[0] || null)}
              />
              <button
                type="button"
                onClick={() => setShowCoverUrlFallback(prev => !prev)}
                className="text-xs text-space-whale-purple hover:text-space-whale-navy font-space-whale-body"
              >
                {showCoverUrlFallback ? 'Hide URL option' : 'Or paste an image URL'}
              </button>
              {showCoverUrlFallback && (
                <input
                  type="url"
                  value={newAlbum.cover_image_url}
                  onChange={(e) => {
                    handleCoverFileSelect(null)
                    setNewAlbum(prev => ({ ...prev, cover_image_url: e.target.value }))
                  }}
                  placeholder="https://example.com/cover-image.jpg"
                  className="w-full mt-2 px-3 py-2 border border-space-whale-lavender/30 rounded-lg focus:ring-2 focus:ring-space-whale-purple focus:border-transparent font-space-whale-body"
                />
              )}
            </div>

            {/* Album Photos */}
            <div>
              <label className="block text-sm font-space-whale-accent text-space-whale-navy mb-1">
                Album Photos
              </label>
              <p className="text-xs text-space-whale-navy/60 font-space-whale-body mb-3">
                Add images, videos, or audio to this collection. You can always add more later.
              </p>
              <div
                className="border-2 border-dashed border-space-whale-lavender/30 rounded-lg p-6 text-center hover:border-space-whale-purple/50 transition-colors cursor-pointer"
                onClick={() => galleryInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-space-whale-purple/60 mx-auto mb-2" />
                <p className="text-sm font-space-whale-body text-space-whale-navy">
                  Click to select files
                </p>
                <p className="text-xs text-space-whale-navy/60 font-space-whale-body mt-1">
                  Select multiple files at once
                </p>
              </div>
              <input
                ref={galleryInputRef}
                type="file"
                multiple
                accept="image/*,video/*,audio/*"
                className="hidden"
                onChange={(e) => {
                  handleGalleryFilesSelect(e.target.files)
                  e.target.value = ''
                }}
              />
              {pendingGalleryFiles.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {pendingGalleryFiles.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between px-3 py-2 bg-space-whale-lavender/10 rounded-lg text-sm font-space-whale-body text-space-whale-navy"
                    >
                      <span className="truncate mr-2">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removePendingGalleryFile(index)}
                        className="text-space-whale-navy/50 hover:text-red-600 shrink-0"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm pt-3 pb-1 -mx-6 px-6 border-t border-space-whale-lavender/20 space-y-3">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newAlbum.is_featured}
                  onChange={(e) => setNewAlbum(prev => ({ ...prev, is_featured: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm font-space-whale-body text-space-whale-navy">
                  Featured Album
                </span>
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false)
                  setEditingAlbum(null)
                  resetForm()
                }}
                disabled={isSubmitting}
                className="px-4 py-2 border border-space-whale-lavender/30 text-space-whale-navy rounded-lg hover:bg-space-whale-lavender/10 transition-colors font-space-whale-body disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 transition-all duration-300 font-space-whale-accent disabled:opacity-50"
              >
                {submitStatus
                  ? submitStatus
                  : isSubmitting
                  ? 'Saving…'
                  : editingAlbum
                    ? pendingGalleryFiles.length > 0
                      ? `Update & Add ${pendingGalleryFiles.length} Photo${pendingGalleryFiles.length === 1 ? '' : 's'}`
                      : 'Update Album'
                    : pendingGalleryFiles.length > 0
                      ? `Create & Add ${pendingGalleryFiles.length} Photo${pendingGalleryFiles.length === 1 ? '' : 's'}`
                      : 'Create Album'}
              </button>
            </div>
            </div>
          </form>
        </div>
      )}

      {/* Albums Grid */}
      {albums.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <div key={album.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-space-whale-lavender/20 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-space-whale-heading text-space-whale-navy mb-2">
                    {album.title}
                  </h3>
                  {album.description && (
                    <p className="text-sm text-space-whale-navy/70 font-space-whale-body mb-3">
                      {album.description}
                    </p>
                  )}
                </div>
                {album.is_featured && (
                  <span className="px-2 py-1 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white text-xs rounded-full font-space-whale-accent">
                    Featured
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {album.event_date && (
                  <div className="flex items-center text-sm text-space-whale-navy/60">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(album.event_date).toLocaleDateString()}
                  </div>
                )}
                {album.event_location && (
                  <div className="flex items-center text-sm text-space-whale-navy/60">
                    <MapPin className="h-4 w-4 mr-2" />
                    {album.event_location}
                  </div>
                )}
                <div className="flex items-center text-sm text-space-whale-navy/60">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  {album.item_count} items
                </div>
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEditAlbum(album)}
                  className="flex-1 px-3 py-2 text-space-whale-purple border border-space-whale-purple/30 rounded-lg hover:bg-space-whale-purple/10 transition-colors text-sm font-space-whale-body"
                >
                  <Edit3 className="h-4 w-4 inline mr-1" />
                  Edit
                </button>
                <button 
                  onClick={() => {
                    setSelectedAlbum(album)
                    setShowBatchUpload(true)
                  }}
                  className="flex-1 px-3 py-2 text-blue-600 border border-blue-600/30 rounded-lg hover:bg-blue-600/10 transition-colors text-sm font-space-whale-body"
                >
                  <Upload className="h-4 w-4 inline mr-1" />
                  Add Photos
                </button>
                <button 
                  onClick={() => handleDeleteAlbum(album)}
                  className="flex-1 px-3 py-2 text-red-600 border border-red-600/30 rounded-lg hover:bg-red-600/10 transition-colors text-sm font-space-whale-body"
                >
                  <Trash2 className="h-4 w-4 inline mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          iconSrc={SPACE_ILLUSTRATIONS.constellation}
          title="No albums yet"
          description="Create your first album to start organizing content by events and projects."
          bordered={false}
          className="py-12"
        >
          <button
            onClick={() => {
              setEditingAlbum(null)
              resetForm()
              setIsCreating(true)
            }}
            className="px-6 py-3 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 transition-all duration-300 font-space-whale-accent"
          >
            Create Your First Album
          </button>
        </EmptyState>
      )}

      {/* Batch Upload Modal */}
      {showBatchUpload && selectedAlbum && (
        <div className="fixed inset-0 bg-gradient-to-br from-space-whale-lavender/90 to-space-whale-purple/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto rainbow-border-soft">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-space-whale-heading text-space-whale-navy">
                  Add Photos to &ldquo;{selectedAlbum.title}&rdquo;
                </h2>
                <button
                  onClick={() => {
                    setShowBatchUpload(false)
                    setSelectedAlbum(null)
                  }}
                  className="text-space-whale-purple hover:text-space-whale-navy transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="border-2 border-dashed border-space-whale-lavender/30 rounded-lg p-8 text-center hover:border-space-whale-purple/50 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleBatchUpload(e.target.files)
                      }
                    }}
                    className="hidden"
                    id="batch-upload"
                    disabled={uploadingFiles}
                  />
                  <label htmlFor="batch-upload" className="cursor-pointer">
                    {uploadingFiles ? (
                      <div className="space-y-4">
                        <div className="text-4xl">⏳</div>
                        <p className="text-lg font-space-whale-body text-space-whale-navy">
                          Uploading files...
                        </p>
                        <p className="text-sm text-space-whale-navy/60 font-space-whale-body">
                          Please wait while we process your files
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 text-space-whale-purple/60 mx-auto" />
                        <div>
                          <p className="text-lg font-space-whale-body text-space-whale-navy mb-2">
                            Click to select multiple files
                          </p>
                          <p className="text-sm text-space-whale-navy/60 font-space-whale-body">
                            Images, videos, and audio files supported
                          </p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>

                <div className="bg-space-whale-lavender/10 rounded-lg p-4">
                  <h3 className="font-space-whale-accent text-space-whale-navy mb-2">
                    How it works:
                  </h3>
                  <ul className="text-sm text-space-whale-navy/70 font-space-whale-body space-y-1">
                    <li>• Files will be uploaded to the archive</li>
                    <li>• Each file becomes an archive item</li>
                    <li>• All items are automatically added to "{selectedAlbum.title}"</li>
                    <li>• File names become item titles</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
