'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { deleteJournalEntry } from '@/lib/database'
import { Calendar, Heart, Edit, Trash2, Lock, Eye, Share2, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface JournalListProps {
  refreshTrigger?: number
}

export default function JournalList({ refreshTrigger }: JournalListProps) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [sharingId, setSharingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editMood, setEditMood] = useState('')
  const [editMediaUrl, setEditMediaUrl] = useState('')
  const [editMediaType, setEditMediaType] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState('')
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)

  useEffect(() => {
    if (user) {
      loadEntries()
    }
  }, [user, refreshTrigger])

  const loadEntries = async () => {
    if (!user) {
      console.log('No user found for journal entries')
      return
    }

    console.log('Loading journal entries for user:', user.id)
    console.log('User object:', user)

    try {
      setLoading(true)
      
      // Use the secure API route instead of direct database function
      const response = await fetch('/api/get-journal-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to load journal entries')
      }

      const data = result.entries
      console.log('Loaded journal entries:', data)
      console.log('Number of entries:', data?.length || 0)
      
      // Debug media data
      data?.forEach((entry: any, index: number) => {
        if (entry.media_url) {
          console.log(`Entry ${index} media:`, {
            hasMedia: !!entry.media_url,
            mediaType: entry.media_type,
            mediaUrl: entry.media_url,
            mediaUrlStart: entry.media_url?.substring(0, 50) + '...',
            isBase64: entry.media_url?.startsWith('data:'),
            isSupabaseUrl: entry.media_url?.includes('supabase.co')
          })
        }
      })
      
      setEntries(data || [])
    } catch (err: any) {
      console.error('Error loading entries:', err)
      console.error('Error details:', err.message, err.code, err.details)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingId(entryId)
      await deleteJournalEntry(entryId)
      setEntries(entries.filter(entry => entry.id !== entryId))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (entry: any) => {
    setEditingId(entry.id)
    setEditTitle(entry.title || '')
    setEditContent(entry.content || '')
    setEditMood(entry.mood || '')
    setEditMediaUrl(entry.media_url || '')
    setEditMediaType(entry.media_type || '')
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
    setEditMood('')
    setEditMediaUrl('')
    setEditMediaType('')
  }

  // Lightbox functions
  const openImageLightbox = (imageUrl: string, allImages: string[], index: number) => {
    console.log('Opening lightbox with:', {
      imageUrl,
      allImages,
      index,
      imageUrlLength: imageUrl?.length,
      allImagesLength: allImages?.length
    })
    setLightboxImage(imageUrl)
    setLightboxImages(allImages)
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setLightboxImage('')
    setLightboxImages([])
    setLightboxIndex(0)
  }

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (lightboxImages.length === 0) return
    
    let newIndex = lightboxIndex
    if (direction === 'prev') {
      newIndex = lightboxIndex > 0 ? lightboxIndex - 1 : lightboxImages.length - 1
    } else {
      newIndex = lightboxIndex < lightboxImages.length - 1 ? lightboxIndex + 1 : 0
    }
    
    setLightboxIndex(newIndex)
    setLightboxImage(lightboxImages[newIndex])
  }

  // Handle keyboard navigation and prevent body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return
      
      if (e.key === 'Escape') {
        closeLightbox()
      } else if (e.key === 'ArrowLeft') {
        navigateLightbox('prev')
      } else if (e.key === 'ArrowRight') {
        navigateLightbox('next')
      }
    }

    // Prevent body scroll when lightbox is open
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [lightboxOpen, lightboxIndex, lightboxImages])

  const handleEditSave = async () => {
    if (!user || !editingId || !editContent.trim()) return

    try {
      setEditLoading(true)
      
      // Use the secure API route for updating
      const response = await fetch('/api/update-journal-entry-secure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entryId: editingId,
          title: editTitle.trim() || undefined,
          content: editContent.trim(),
          mood: editMood || undefined,
          tags: [], // You can add tag functionality later
          media_url: editMediaUrl || undefined,
          media_type: editMediaType || undefined,
          is_private: true,
          userId: user.id
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to update journal entry')
      }

      // Update the entry in the local state
      setEntries(entries.map(entry => 
        entry.id === editingId 
          ? { ...entry, ...result.entry }
          : entry
      ))

      handleEditCancel()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setEditLoading(false)
    }
  }

  const handleShareToCommunity = async (entry: any) => {
    if (!user) {
      setError('You must be logged in to share to the community')
      return
    }

    if (!confirm('Share this entry to the Community Orbit? It will be visible to other space whales.')) {
      return
    }

    try {
      setSharingId(entry.id)
      
      // Create a community post from this journal entry
      const postData = {
        content: entry.content,
        media_url: entry.media_url || undefined,
        media_type: entry.media_type || undefined,
        tags: entry.tags || []
      }
      
      // Use the secure API route instead of direct database function
      const response = await fetch('/api/create-post-secure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: postData.content,
          tags: postData.tags,
          content_warning: undefined, // You can add content warning functionality later
          media_url: postData.media_url,
          media_type: postData.media_type,
          userId: user.id
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to create community post')
      }
      
      // Show success message
      alert('✨ Your thoughts are now floating in the Community Orbit! ✨')
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSharingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    
    // Check if it's the same day
    const isSameDay = date.toDateString() === now.toDateString()
    if (isSameDay) return 'Today'
    
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const getMoodEmoji = (mood: string) => {
    const moodMap: Record<string, string> = {
      'joyful': '😊',
      'calm': '😌',
      'anxious': '😰',
      'sad': '😢',
      'angry': '😠',
      'grateful': '🙏',
      'excited': '🤩',
      'peaceful': '🧘',
      'overwhelmed': '😵',
      'hopeful': '✨',
    }
    return moodMap[mood] || '😊'
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading your entries...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={loadEntries}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No entries yet</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Start your journey by creating your first journal entry
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>Your journal is a safe space for reflection and growth</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div key={entry.id} className="bg-lofi-card rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 rainbow-border-soft">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-space-whale-subheading text-space-whale-navy">
                  {entry.title || 'Untitled Entry'}
                </h3>
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-space-whale-purple" />
                  <span className="text-xs text-space-whale-purple font-space-whale-body">Private</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-space-whale-purple font-space-whale-body">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(entry.created_at)}
                </div>
                {entry.mood && (
                  <div className="flex items-center">
                    <span className="mr-1">{getMoodEmoji(entry.mood)}</span>
                    <span className="capitalize">{entry.mood}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handleShareToCommunity(entry)}
                disabled={sharingId === entry.id}
                className="p-2 text-gray-400 hover:text-pink-500 transition-colors disabled:opacity-50"
                title="Share to Community Orbit"
              >
                {sharingId === entry.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
              </button>
              <button 
                onClick={() => handleEdit(entry)}
                className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                title="Edit entry"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleDelete(entry.id)}
                disabled={deletingId === entry.id}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
              >
                {deletingId === entry.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          
          <div className="prose prose-sm max-w-none">
            {/* Edit Form */}
            {editingId === entry.id ? (
              <div className="bg-lofi-card rounded-lg p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-space-whale-navy mb-2">Title (optional)</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-space-whale-lavender/30 rounded-lg focus:ring-2 focus:ring-space-whale-purple focus:border-transparent"
                    placeholder="Add a title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-space-whale-navy mb-2">Content *</label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 border border-space-whale-lavender/30 rounded-lg focus:ring-2 focus:ring-space-whale-purple focus:border-transparent"
                    rows={4}
                    placeholder="What's on your mind?"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-space-whale-navy mb-2">Mood (optional)</label>
                  <input
                    type="text"
                    value={editMood}
                    onChange={(e) => setEditMood(e.target.value)}
                    className="w-full px-3 py-2 border border-space-whale-lavender/30 rounded-lg focus:ring-2 focus:ring-space-whale-purple focus:border-transparent"
                    placeholder="How are you feeling?"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleEditSave}
                    disabled={editLoading || !editContent.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleEditCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Only show content if it's not a mood board */}
                {entry.media_type !== 'moodboard' && (
                  <p className="text-space-whale-navy whitespace-pre-wrap line-clamp-4 font-space-whale-body">
                    {entry.content}
                  </p>
                )}
              </>
            )}
            
            {/* Media Display */}
            {entry.media_url && (
              <div className="mt-4">
                {entry.media_type === 'image' ? (
                  <img
                    src={entry.media_url}
                    alt="Journal media"
                    className="max-w-full h-48 object-cover rounded-lg shadow-sm"
                    onError={(e) => {
                      console.log('❌ Image failed to load:', entry.media_url)
                      console.log('Media type:', entry.media_type)
                      console.log('Error event:', e)
                      // Hide broken images (old blob URLs)
                      if (entry.media_url?.startsWith('blob:')) {
                        console.log('Hiding broken blob URL image')
                        e.currentTarget.style.display = 'none'
                      }
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', entry.media_url?.substring(0, 50) + '...')
                    }}
                  />
                ) : entry.media_type === 'moodboard' ? (
                  <div className="space-y-4">
                    <div className="text-sm text-space-whale-purple font-space-whale-body mb-4">
                      ✨ {entry.tags ? entry.tags.filter((url: string) => url && (url.startsWith('data:image/') || url.startsWith('https://'))).length : 1} image{entry.tags && entry.tags.filter((url: string) => url && (url.startsWith('data:image/') || url.startsWith('https://'))).length > 1 ? 's' : ''}
                    </div>
                    {/* Beautiful mood board grid */}
                    {entry.tags && entry.tags.length > 0 ? (
                      <div className="mood-board-grid">
                        {entry.tags
                          .filter((imageUrl: string) => imageUrl && (imageUrl.startsWith('data:image/') || imageUrl.startsWith('https://')))
                          .map((imageUrl: string, index: number) => (
                            <div 
                              key={index} 
                              className="mood-board-item cursor-pointer"
                              onClick={() => openImageLightbox(imageUrl, entry.tags.filter((url: string) => url && (url.startsWith('data:image/') || url.startsWith('https://'))), index)}
                            >
                              <img
                                src={imageUrl}
                                alt={`Mood board image ${index + 1}`}
                                className="mood-board-image"
                                onError={(e) => {
                                  console.log('Mood board image failed to load')
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            </div>
                          ))}
                      </div>
                    ) : (
                      // Empty state for mood boards
                      <div className="mood-board-empty">
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">✨</div>
                          <p className="text-space-whale-navy/60 font-space-whale-body mb-4">
                            Your mood board is empty. Add images to begin.
                          </p>
                          <button className="px-6 py-3 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 transition-colors font-space-whale-accent">
                            + Add Images
                          </button>
                        </div>
                      </div>
                    )}
                    {/* Show count if there are more than 6 images */}
                    {entry.tags && entry.tags.filter((url: string) => url.startsWith('data:image/')).length > 6 && (
                      <div className="text-center">
                        <span className="inline-flex items-center px-3 py-1 bg-space-whale-lavender/20 text-space-whale-purple text-sm rounded-full">
                          + {entry.tags.filter((url: string) => url.startsWith('data:image/')).length - 6} more images
                        </span>
                      </div>
                    )}
                  </div>
                ) : entry.media_type === 'video' ? (
                  <video
                    src={entry.media_url}
                    controls
                    className="max-w-full h-48 object-cover rounded-lg shadow-sm"
                  />
                ) : (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                          {entry.media_type === 'audio' ? '🎵' : '📄'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {entry.media_type === 'audio' ? 'Audio File' : 'Document'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {entry.media_url.split('/').pop()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <button className="flex items-center text-space-whale-purple hover:text-space-whale-navy text-sm font-space-whale-accent transition-colors">
              <Eye className="h-4 w-4 mr-1" />
              Read full entry
            </button>
            
            {entry.tags && entry.tags.length > 0 && entry.media_type !== 'moodboard' && (
              <div className="flex flex-wrap gap-1">
                {entry.tags.slice(0, 3).map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
                {entry.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                    +{entry.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
      

      {/* Mood Board Image Modal - Simple & Effective like Community Orbit */}
      {lightboxOpen && lightboxImage && (
        <div 
          className="fixed inset-0 bg-gradient-to-br from-space-whale-lavender/90 to-space-whale-purple/90 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4"
          onClick={closeLightbox}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="relative max-w-6xl max-h-[95vh] w-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            
            {/* Navigation arrows - only show if multiple images */}
            {lightboxImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateLightbox('prev')
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateLightbox('next')
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            
            {/* Main Image */}
            <img
              src={lightboxImage}
              alt="Mood board image - click to close"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl cursor-pointer"
              onClick={(e) => e.stopPropagation()}
              style={{ maxHeight: '90vh', maxWidth: '90vw' }}
            />
            
            {/* Image counter - only show if multiple images */}
            {lightboxImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {lightboxIndex + 1} / {lightboxImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
