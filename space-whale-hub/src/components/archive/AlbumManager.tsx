'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, Calendar, MapPin, Image as ImageIcon, FolderOpen, Upload, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { uploadMedia } from '@/lib/storage-client'

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
  const [newAlbum, setNewAlbum] = useState({
    title: '',
    description: '',
    cover_image_url: '',
    event_date: '',
    event_location: '',
    is_featured: false,
    sort_order: 0
  })

  const loadAlbums = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/get-albums-secure')
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
    if (!user) return

    try {
      const response = await fetch('/api/create-album-secure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newAlbum,
          created_by: user.id
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to create album')
      }

      // Reset form and reload albums
      setNewAlbum({
        title: '',
        description: '',
        cover_image_url: '',
        event_date: '',
        event_location: '',
        is_featured: false,
        sort_order: 0
      })
      setIsCreating(false)
      loadAlbums()
    } catch (error) {
      console.error('Error creating album:', error)
      alert('Failed to create album. Please try again.')
    }
  }

  const handleEditAlbum = (album: Album) => {
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
    if (!editingAlbum || !user) return

    try {
      const response = await fetch('/api/update-album-secure', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingAlbum.id,
          ...newAlbum
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to update album')
      }

      setEditingAlbum(null)
      setNewAlbum({
        title: '',
        description: '',
        cover_image_url: '',
        event_date: '',
        event_location: '',
        is_featured: false,
        sort_order: 0
      })
      loadAlbums()
    } catch (error) {
      console.error('Error updating album:', error)
      alert('Failed to update album. Please try again.')
    }
  }

  const handleDeleteAlbum = async (album: Album) => {
    if (!confirm(`Are you sure you want to delete "${album.title}"? This will also remove all items from the album.`)) {
      return
    }

    try {
      const response = await fetch('/api/update-album-secure', {
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
    } catch (error) {
      console.error('Error deleting album:', error)
      alert('Failed to delete album. Please try again.')
    }
  }

  const handleBatchUpload = async (files: FileList) => {
    if (!selectedAlbum || !user) return

    setUploadingFiles(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Upload file
        const uploadResult = await uploadMedia(file, {
          category: 'archive',
          filename: `${Date.now()}-${file.name}`
        }, 'archive-uploads')

        // Create archive item
        const response = await fetch('/api/create-constellation-item-secure', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
            description: `Uploaded to ${selectedAlbum.title}`,
            content_type: file.type.startsWith('image/') ? 'artwork' : 
                          file.type.startsWith('video/') ? 'video' : 'artwork',
            media_url: uploadResult.url,
            artist_name: '',
            tags: [selectedAlbum.title.toLowerCase().replace(/\s+/g, '-')],
            user_id: user.id
          })
        })

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || 'Failed to create archive item')
        }

        // Add to album
        const albumResponse = await fetch('/api/manage-album-items-secure', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            album_id: selectedAlbum.id,
            item_id: result.data.id,
            added_by: user.id
          })
        })

        const albumResult = await albumResponse.json()
        if (!albumResult.success) {
          throw new Error(albumResult.error || 'Failed to add item to album')
        }

        return result.data
      })

      await Promise.all(uploadPromises)
      setShowBatchUpload(false)
      setSelectedAlbum(null)
      loadAlbums()
      alert(`Successfully uploaded ${files.length} files to ${selectedAlbum.title}!`)
    } catch (error) {
      console.error('Error batch uploading:', error)
      alert('Failed to upload files. Please try again.')
    } finally {
      setUploadingFiles(false)
    }
  }

  useEffect(() => {
    loadAlbums()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-4xl mb-2">🐋</div>
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
          onClick={() => setIsCreating(true)}
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
          <form onSubmit={editingAlbum ? handleUpdateAlbum : handleCreateAlbum} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
                  Album Title *
                </label>
                <input
                  type="text"
                  value={newAlbum.title}
                  onChange={(e) => setNewAlbum(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Pride Poetry - Coastal Twist Festival"
                  className="w-full px-3 py-2 border border-space-whale-lavender/30 rounded-lg focus:ring-2 focus:ring-space-whale-purple focus:border-transparent font-space-whale-body"
                  required
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div>
                <label className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={newAlbum.cover_image_url}
                  onChange={(e) => setNewAlbum(prev => ({ ...prev, cover_image_url: e.target.value }))}
                  placeholder="https://example.com/cover-image.jpg"
                  className="w-full px-3 py-2 border border-space-whale-lavender/30 rounded-lg focus:ring-2 focus:ring-space-whale-purple focus:border-transparent font-space-whale-body"
                />
              </div>
            </div>

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
                  setNewAlbum({
                    title: '',
                    description: '',
                    cover_image_url: '',
                    event_date: '',
                    event_location: '',
                    is_featured: false,
                    sort_order: 0
                  })
                }}
                className="px-4 py-2 border border-space-whale-lavender/30 text-space-whale-navy rounded-lg hover:bg-space-whale-lavender/10 transition-colors font-space-whale-body"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 transition-all duration-300 font-space-whale-accent"
              >
                {editingAlbum ? 'Update Album' : 'Create Album'}
              </button>
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
                  Upload
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
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-space-whale-heading text-space-whale-navy mb-2">
            No albums yet
          </h3>
          <p className="text-space-whale-navy/70 font-space-whale-body mb-6">
            Create your first album to start organizing content by events and projects.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-6 py-3 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 transition-all duration-300 font-space-whale-accent"
          >
            Create Your First Album
          </button>
        </div>
      )}

      {/* Batch Upload Modal */}
      {showBatchUpload && selectedAlbum && (
        <div className="fixed inset-0 bg-gradient-to-br from-space-whale-lavender/90 to-space-whale-purple/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto rainbow-border-soft">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-space-whale-heading text-space-whale-navy">
                  Batch Upload to "{selectedAlbum.title}"
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
