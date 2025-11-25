'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Heart, MessageCircle, MoreHorizontal, Bookmark, Edit, Trash2, X, ZoomIn, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import CommentForm from './CommentForm'
import CommentsList from './CommentsList'

interface Post {
  id: string
  content: string
  tags: string[]
  content_warning?: string
  media_url?: string
  media_type?: string
  created_at: string
  author: {
    display_name: string
    pronouns?: string
    avatar_url?: string
  }
  likes_count: number
  comments_count: number
  is_liked: boolean
}

interface PostCardProps {
  post: Post
  onLike?: (postId: string) => void
  onComment?: (postId: string) => void
  onEdit?: (postId: string) => void
  onDelete?: (postId: string) => void
  onBookmark?: (postId: string) => void
}

export default function PostCard({ post, onLike, onComment, onEdit, onDelete, onBookmark }: PostCardProps) {
  const { user } = useAuth()
  const [showContent, setShowContent] = useState(!post.content_warning)
  const [showOptions, setShowOptions] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [commentsRefreshTrigger, setCommentsRefreshTrigger] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState('')
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  const isAuthor = user?.id === post.author.id

  // Lightbox functions for mood board
  const openImageLightbox = (imageUrl: string, allImages: string[], index: number) => {
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
    
    let newIndex
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

  return (
    <div className="bg-lofi-card rounded-xl shadow-lg p-3 sm:p-4 rainbow-border-soft mobile-card">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gradient-to-br from-space-whale-purple to-accent-pink flex items-center justify-center flex-shrink-0">
            {post.author.avatar_url ? (
              <img
                src={post.author.avatar_url}
                alt={post.author.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-xs sm:text-sm">
                {post.author.display_name?.charAt(0) || '?'}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-space-whale-subheading text-space-whale-navy text-sm sm:text-base truncate">
                {post.author.display_name}
              </h3>
              {post.content_warning && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium flex-shrink-0">
                  <AlertCircle className="h-3 w-3" />
                  <span>CW</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-space-whale-body text-space-whale-purple">
              {post.author.pronouns && `${post.author.pronouns} • `}
              {formatDate(post.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          {isAuthor && (
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              
              {showOptions && (
                <div className="absolute right-0 top-8 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-10 min-w-[120px]">
                  <button
                    onClick={() => {
                      onEdit?.(post.id)
                      setShowOptions(false)
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDelete?.(post.id)
                      setShowOptions(false)
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
          
          <button 
            onClick={() => onBookmark?.(post.id)}
            className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
            title="Save for later"
          >
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content Warning */}
      {post.content_warning && !showContent && (
        <div className="mb-4 p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Content Warning: {post.content_warning}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                This post may contain sensitive content
              </p>
            </div>
            <button
              onClick={() => setShowContent(true)}
              className="px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors w-full sm:w-auto"
            >
              Show Content
            </button>
          </div>
        </div>
      )}

      {/* Post Content */}
      {showContent && (
        <div className="mb-3">
          <p className="text-space-whale-navy font-space-whale-body whitespace-pre-wrap">
            {post.content}
          </p>
          
          {/* Media Display */}
          {post.media_url && (
            <div className="mt-3">
              {post.media_type === 'image' ? (
                <div className="relative group cursor-pointer" onClick={() => setShowImageModal(true)}>
                  <img
                    src={post.media_url}
                    alt="Post media"
                    className="w-full h-72 sm:h-96 object-cover rounded-xl shadow-md transition-transform group-hover:scale-[1.02]"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="h-4 w-4 text-white" />
                  </div>
                </div>
              ) : post.media_type === 'video' ? (
                <video
                  src={post.media_url}
                  controls
                  className="w-full h-72 sm:h-96 object-cover rounded-xl shadow-md"
                />
              ) : post.media_type === 'mood' ? (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 dark:bg-indigo-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl sm:text-2xl">😊</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Mood Shared</p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">User shared their current mood</p>
                    </div>
                  </div>
                </div>
              ) : post.media_type === 'moodboard' ? (
                <div className="space-y-4">
                  <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-3">
                    ✨ Mood Board
                  </div>
                  {/* Beautiful mood board grid for community posts */}
                  {post.tags && post.tags.length > 0 ? (
                    <div className="mood-board-grid">
                      {post.tags
                        .filter((imageUrl: string) => imageUrl && (imageUrl.startsWith('data:image/') || imageUrl.startsWith('https://')))
                        .slice(0, 6) // Show max 6 images in community feed
                        .map((imageUrl: string, index: number) => (
                          <div 
                            key={index} 
                            className="mood-board-item cursor-pointer"
                            onClick={() => openImageLightbox(imageUrl, post.tags.filter((url: string) => url && (url.startsWith('data:image/') || url.startsWith('https://'))), index)}
                          >
                            <img
                              src={imageUrl}
                              alt={`Mood board image ${index + 1}`}
                              className="mood-board-image"
                              onError={(e) => {
                                console.log('Mood board image failed to load in community feed')
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-4xl mb-2">✨</div>
                      <p className="text-gray-600 dark:text-gray-400">Mood board is empty</p>
                    </div>
                  )}
                  {/* Show count if there are more than 6 images */}
                  {post.tags && post.tags.filter((url: string) => url && (url.startsWith('data:image/') || url.startsWith('https://'))).length > 6 && (
                    <div className="text-center">
                      <span className="inline-flex items-center px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-sm rounded-full">
                        + {post.tags.filter((url: string) => url && (url.startsWith('data:image/') || url.startsWith('https://'))).length - 6} more images
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm sm:text-base">📄</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Media File</p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                        {post.media_url.split('/').pop()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Tags - Hide URLs for mood board posts */}
          {post.tags && post.tags.length > 0 && post.media_type !== 'moodboard' && (
            <div className="flex flex-wrap gap-2 mt-3">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 sm:space-x-6">
          <button
            onClick={() => onLike?.(post.id)}
            className={`flex items-center space-x-1.5 sm:space-x-2 transition-all duration-200 p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 ${
              post.is_liked
                ? 'text-red-500 hover:text-red-600'
                : 'text-gray-500 hover:text-red-500'
            }`}
            aria-label={post.is_liked ? 'Unlike' : 'Like'}
          >
            <Heart className={`h-5 w-5 sm:h-5 sm:w-5 transition-transform ${post.is_liked ? 'fill-current scale-110' : ''}`} />
            {post.likes_count > 0 && (
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{post.likes_count}</span>
            )}
          </button>

          <button
            onClick={() => {
              setShowComments(!showComments)
              setShowCommentForm(!showComments)
              onComment?.(post.id)
            }}
            className={`flex items-center space-x-1.5 sm:space-x-2 transition-all duration-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 ${
              showComments ? 'text-indigo-500' : 'text-gray-500 hover:text-indigo-500'
            }`}
            aria-label="Comments"
          >
            <MessageCircle className={`h-5 w-5 sm:h-5 sm:w-5 ${showComments ? 'fill-current' : ''}`} />
            {post.comments_count > 0 && (
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{post.comments_count}</span>
            )}
          </button>

        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            {/* Comment Form */}
            {showCommentForm && (
              <CommentForm
                postId={post.id}
                onCommentAdded={() => {
                  setCommentsRefreshTrigger(prev => prev + 1)
                  setShowCommentForm(false)
                }}
                onCancel={() => setShowCommentForm(false)}
              />
            )}

            {/* Comments List */}
            <CommentsList
              postId={post.id}
              refreshTrigger={commentsRefreshTrigger}
            />
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-gradient-to-br from-space-whale-lavender/90 to-space-whale-purple/90 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={() => setShowImageModal(false)}
        >
          {post.media_type === 'image' && post.media_url ? (
            <img
              src={post.media_url}
              alt="Post media - enlarged (click to close)"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl cursor-pointer"
              onClick={() => setShowImageModal(false)}
            />
          ) : post.media_type === 'moodboard' && post.tags && post.tags.length > 0 ? (
            <div className="max-w-6xl max-h-[90vh] w-full">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-white mb-2">✨ Mood Board</h3>
                <p className="text-white/80">Click outside to close</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto">
                {post.tags
                  .filter((imageUrl: string) => imageUrl && (imageUrl.startsWith('data:image/') || imageUrl.startsWith('https://')))
                  .map((imageUrl: string, index: number) => (
                    <img
                      key={index}
                      src={imageUrl}
                      alt={`Mood board image ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg shadow-lg cursor-pointer hover:scale-105 transition-transform"
                      onClick={(e) => e.stopPropagation()}
                      onError={(e) => {
                        console.log('Mood board image failed to load in modal')
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Mood Board Lightbox Modal */}
      {lightboxOpen && lightboxImage && (
        <div 
          className="fixed inset-0 bg-gradient-to-br from-space-whale-lavender/90 to-space-whale-purple/90 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4"
          onClick={closeLightbox}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="relative max-w-4xl max-h-[80vh] w-full flex items-center justify-center">
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
              className="max-w-3xl max-h-[75vh] object-contain rounded-lg shadow-2xl cursor-pointer"
              onClick={(e) => e.stopPropagation()}
              style={{ maxHeight: '75vh', maxWidth: '60vw' }}
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
