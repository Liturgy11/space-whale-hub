'use client'

import { useState, useEffect } from 'react'
// Removed direct database import - using secure API route instead
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
  const [isClient, setIsClient] = useState(false)

  // Prevent hydration mismatches
  useEffect(() => {
    setIsClient(true)
  }, [])

  const loadConstellationItems = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/get-constellation-items-secure', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch constellation items')
      }

      setArchiveItems(result.data || [])
    } catch (error) {
      console.error('Error fetching constellation items:', error)
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
    loadConstellationItems()
  }, [])

  const handleUploadComplete = () => {
    // Refresh the constellation items after upload
    loadConstellationItems()
  }

  const handleDeleteItem = (id: string) => {
    // Remove the item from the local state
    setArchiveItems(prev => prev.filter(item => item.id !== id))
    // Close modal if it's open
    setIsModalOpen(false)
    setSelectedItem(null)
  }

  const handleUpdateItem = (updatedItem: ArchiveItem) => {
    // Update the item in the local state
    setArchiveItems(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ))
    // Update the selected item if it's the one being edited
    if (selectedItem && selectedItem.id === updatedItem.id) {
      setSelectedItem(updatedItem)
    }
  }

  if (loading || !isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-space-whale-lavender/20 via-white to-space-whale-purple/10 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐋</div>
          <p className="text-lg text-space-whale-navy font-space-whale-body">Gathering the harvest...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-space-whale-lavender/20 via-white to-space-whale-purple/10" suppressHydrationWarning>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-space-whale-heading text-space-whale-navy mb-4">
                Constellation
              </h1>
              <p className="text-lg text-space-whale-navy/70 font-space-whale-body">
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
              // Check if it's an external URL (not Supabase Storage)
              item.media_url && item.media_url.startsWith('http') && !item.media_url.includes('supabase') ? (
                // External link - show LinkPreview as the entire card
                <LinkPreview 
                  key={item.id}
                  url={item.media_url}
                  title={item.title}
                  description={item.description}
                  className="rounded-xl"
                />
              ) : (
                // Regular archive item with media
                <div 
                  key={item.id} 
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer rainbow-border-soft"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="relative">
                    {item.media_url ? (
                      item.content_type === 'video' ? (
                        <video 
                          src={item.media_url} 
                          className="w-full aspect-video object-cover rounded-t-xl"
                          controls
                        />
                      ) : (
                        <img 
                          src={item.media_url} 
                          alt={item.title}
                          className="w-full max-h-80 object-contain rounded-t-xl"
                          style={{ aspectRatio: 'auto' }}
                          onError={(e) => {
                            console.log('Archive image failed to load:', item.media_url)
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.parentElement.innerHTML = `
                              <div class="w-full h-80 bg-gradient-to-br from-space-whale-lavender/30 to-space-whale-purple/30 flex items-center justify-center rounded-t-xl">
                                <span class="text-4xl">🐋</span>
                              </div>
                            `
                          }}
                        />
                      )
                    ) : (
                      <div className="w-full h-80 bg-gradient-to-br from-space-whale-lavender/30 to-space-whale-purple/30 flex items-center justify-center rounded-t-xl">
                        <span className="text-4xl">🐋</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-space-whale-accent text-space-whale-purple uppercase tracking-wide">
                        {item.content_type}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-space-whale-heading text-space-whale-navy mb-2 group-hover:text-space-whale-purple transition-colors">
                      {item.title}
                    </h3>
                    
                    {item.description && (
                      <p className="text-sm text-space-whale-navy/70 font-space-whale-body mb-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    
                    {item.artist_name && (
                      <p className="text-sm text-space-whale-navy/60 font-space-whale-body mb-4">
                        by {item.artist_name}
                      </p>
                    )}
                    
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-space-whale-lavender/20 text-space-whale-purple text-xs rounded-full font-space-whale-body"
                          >
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="px-2 py-1 bg-space-whale-lavender/20 text-space-whale-purple text-xs rounded-full font-space-whale-body">
                            +{item.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🐋</div>
              <h3 className="text-xl font-space-whale-heading text-space-whale-navy mb-2">
                Contribute your art to our constellation
              </h3>
              <p className="text-space-whale-navy/70 font-space-whale-body mb-6">
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
        onDelete={handleDeleteItem}
        onUpdate={handleUpdateItem}
      />
    </div>
  )
}
