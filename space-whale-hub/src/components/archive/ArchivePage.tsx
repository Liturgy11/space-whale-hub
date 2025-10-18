'use client'

import { useState, useEffect } from 'react'
import { getArchiveItems } from '@/lib/database'
import ArchiveUpload from './ArchiveUpload'
import ArchiveItemModal from './ArchiveItemModal'
import LinkPreview from './LinkPreview'

interface ArchiveItem {
  id: string
  title: string
  description?: string
  content_type: 'video' | 'artwork' | 'zine' | 'audio'
  media_url: string
  thumbnail_url?: string
  artist_name?: string
  tags?: string[]
  created_at: string
}

export default function ArchivePage() {
  const [archiveItems, setArchiveItems] = useState<ArchiveItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadArchiveItems = async () => {
    try {
      setLoading(true)
      const items = await getArchiveItems()
      setArchiveItems(items)
    } catch (error) {
      console.error('Error fetching archive items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleItemClick = (item: ArchiveItem) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
  }

  useEffect(() => {
    loadArchiveItems()
  }, [])

  const handleUploadComplete = () => {
    // Refresh the archive items after upload
    loadArchiveItems()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐋</div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Gathering the harvest...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                The Archive
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                A collection of creative work from our community - poetry, art, videos, and more from fellow space whales.
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <ArchiveUpload onUploadComplete={handleUploadComplete} />
            </div>
          </div>
        </div>

        {/* Archive Grid */}
        {archiveItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {archiveItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                <div className="relative">
                  {item.media_url ? (
                    // Check if it's an external URL (not Supabase Storage)
                    item.media_url.startsWith('http') && !item.media_url.includes('supabase') ? (
                      // External link - show LinkPreview
                      <LinkPreview 
                        url={item.media_url}
                        title={item.title}
                        description={item.description}
                        className="rounded-t-xl"
                      />
                    ) : (
                      // Direct image/video file (including Supabase Storage URLs)
                      item.content_type === 'video' ? (
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
                      )
                    )
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center">
                      <span className="text-4xl">🐋</span>
                    </div>
                  )}
                  {item.content_type === 'video' && !item.media_url?.startsWith('http') && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 rounded-full p-4">
                        <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                      {item.content_type}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h3>
                  
                  {item.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  
                  {item.artist_name && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      by {item.artist_name}
                    </p>
                  )}
                  
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🐋</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Contribute your art to our community archive
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Share your creative work with fellow space whales. We'd love to see what you're creating.
              </p>
              <ArchiveUpload onUploadComplete={handleUploadComplete} />
            </div>
          </div>
        )}
      </main>

      {/* Archive Item Modal */}
      <ArchiveItemModal 
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
