'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Heart, MessageCircle, MoreHorizontal, Bookmark, Edit, Trash2, X, ZoomIn } from 'lucide-react'
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

  return (
    <div className="bg-lofi-card rounded-xl shadow-lg p-6 rainbow-border-soft">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-space-whale-purple to-accent-pink flex items-center justify-center">
            {post.author.avatar_url ? (
              <img
                src={post.author.avatar_url}
                alt={post.author.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-sm">
                {post.author.display_name?.charAt(0) || '?'}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-space-whale-subheading text-space-whale-navy">
              {post.author.display_name}
            </h3>
            <p className="text-sm font-space-whale-body text-space-whale-purple">
              {post.author.pronouns && `${post.author.pronouns} • `}
              {formatDate(post.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isAuthor && (
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              
              {showOptions && (
                <div className="absolute right-0 top-8 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-10">
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
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Content Warning: {post.content_warning}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                This post may contain sensitive content
              </p>
            </div>
            <button
              onClick={() => setShowContent(true)}
              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Show Content
            </button>
          </div>
        </div>
      )}

      {/* Post Content */}
      {showContent && (
        <div className="mb-4">
          <p className="text-space-whale-navy font-space-whale-body whitespace-pre-wrap">
            {post.content}
          </p>
          
          {/* Media Display */}
          {post.media_url && (
            <div className="mt-4">
              {post.media_type === 'image' ? (
                <div className="relative group cursor-pointer" onClick={() => setShowImageModal(true)}>
                  <img
                    src={post.media_url}
                    alt="Post media"
                    className="max-w-full h-64 object-cover rounded-lg shadow-sm transition-transform group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="h-4 w-4 text-white" />
                  </div>
                </div>
              ) : post.media_type === 'video' ? (
                <video
                  src={post.media_url}
                  controls
                  className="max-w-full h-64 object-cover rounded-lg shadow-sm"
                />
              ) : post.media_type === 'mood' ? (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">😊</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Mood Shared</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">User shared their current mood</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">📄</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Media File</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {post.media_url.split('/').pop()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
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
        <div className="flex items-center space-x-6">
          <button
            onClick={() => onLike?.(post.id)}
            className={`flex items-center space-x-2 transition-colors ${
              post.is_liked
                ? 'text-red-500 hover:text-red-600'
                : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart className={`h-5 w-5 ${post.is_liked ? 'fill-current' : ''}`} />
            {post.likes_count > 0 && (
              <span className="text-xs text-gray-400 font-normal">{post.likes_count}</span>
            )}
          </button>

          <button
            onClick={() => {
              setShowComments(!showComments)
              setShowCommentForm(!showComments)
              onComment?.(post.id)
            }}
            className={`flex items-center space-x-2 transition-colors ${
              showComments ? 'text-indigo-500' : 'text-gray-500 hover:text-indigo-500'
            }`}
          >
            <MessageCircle className="h-5 w-5" />
            {post.comments_count > 0 && (
              <span className="text-xs text-gray-400 font-normal">{post.comments_count}</span>
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
      {showImageModal && post.media_url && post.media_type === 'image' && (
        <div 
          className="fixed inset-0 bg-gradient-to-br from-space-whale-lavender/90 to-space-whale-purple/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <img
            src={post.media_url}
            alt="Post media - enlarged (click to close)"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl cursor-pointer"
            onClick={() => setShowImageModal(false)}
          />
        </div>
      )}
    </div>
  )
}
