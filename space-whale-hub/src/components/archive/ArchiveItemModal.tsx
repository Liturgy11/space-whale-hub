'use client'

import { useState } from 'react'
import { X, ExternalLink, Calendar, User, Tag, Heart, Share2 } from 'lucide-react'
import LinkPreview from './LinkPreview'

interface ArchiveItem {
  id: string
  title: string
  description?: string
  content_type: 'video' | 'artwork' | 'zine' | 'audio'
  media_url?: string
  artist_name?: string
  tags?: string[]
  created_at: string
}

interface ArchiveItemModalProps {
  item: ArchiveItem | null
  isOpen: boolean
  onClose: () => void
}

export default function ArchiveItemModal({ item, isOpen, onClose }: ArchiveItemModalProps) {
  if (!item || !isOpen) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥'
      case 'artwork': return '🎨'
      case 'zine': return '📖'
      case 'audio': return '🎵'
      default: return '📄'
    }
  }

  const isExternalLink = item.media_url?.startsWith('http') && !item.media_url.includes('supabase')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getContentTypeIcon(item.content_type)}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {item.title}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(item.created_at)}
                  </span>
                  {item.artist_name && (
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {item.artist_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Media Content */}
          <div className="mb-6">
            {item.media_url ? (
              isExternalLink ? (
                <LinkPreview 
                  url={item.media_url}
                  title={item.title}
                  description={item.description}
                  className="rounded-lg"
                />
              ) : (
                <div className="rounded-lg overflow-hidden">
                  {item.content_type === 'video' ? (
                    <video 
                      src={item.media_url} 
                      className="w-full aspect-video object-cover"
                      controls
                    />
                  ) : (
                    <img 
                      src={item.media_url} 
                      alt={item.title}
                      className="w-full aspect-video object-cover"
                    />
                  )}
                </div>
              )
            ) : (
              <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center rounded-lg">
                <span className="text-4xl">🐋</span>
              </div>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                About this creation
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {item.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                <Tag className="h-5 w-5 inline mr-1" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <button className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors">
                <Heart className="h-4 w-4 mr-2" />
                Like
              </button>
              <button className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-indigo-500 transition-colors">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
            </div>
            
            {isExternalLink && (
              <a
                href={item.media_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Original
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
