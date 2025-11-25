'use client'

import { useState, useEffect } from 'react'
import { Search, Tag, FolderOpen, Calendar, MapPin, Image as ImageIcon } from 'lucide-react'
// Removed direct database import - using secure API route instead
import ArchiveUpload from './ArchiveUpload'
import ArchiveItemModal from './ArchiveItemModal'
import LinkPreview from './LinkPreview'
import { getSignedUrls, createSignedUrlMap } from '@/lib/signed-urls'
import Link from 'next/link'

interface ArchiveItem {
  id: string
  title: string
  description?: string
  content_type: 'video' | 'artwork' | 'zine' | 'audio'
  media_url: string
  thumbnail_url?: string
  artist_name?: string
  tags?: string[]
  user_id?: string
  created_at: string
}

interface AlbumCardData {
  id: string
  title: string
  description?: string
  cover_image_url?: string
  event_date?: string
  event_location?: string
  item_count: number
}

export default function ArchivePage() {
  // Albums-first view
  const [albums, setAlbums] = useState<AlbumCardData[]>([])
  const [filteredAlbums, setFilteredAlbums] = useState<AlbumCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [signedUrlMap, setSignedUrlMap] = useState<Record<string, string>>({})

  // Prevent hydration mismatches
  useEffect(() => {
    setIsClient(true)
  }, [])

  const loadConstellationItems = async () => {
    try {
      setLoading(true)
      console.log('[ArchivePage] Loading albums from /api/get-albums-secure...')
      
      // Fetch albums for public Constellation view
      const response = await fetch('/api/get-albums-secure', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store' // Ensure fresh data
      })
      
      console.log('[ArchivePage] Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[ArchivePage] API response not OK:', response.status, errorText)
        throw new Error(`Failed to fetch albums: ${response.status} ${response.statusText}. ${errorText}`)
      }
      
      const result = await response.json()
      console.log('[ArchivePage] Albums API response:', result)

      if (!result.success) {
        console.error('[ArchivePage] API returned error:', result.error, result.details)
        throw new Error(result.error || 'Failed to fetch albums')
      }

      const data = result.data || []
      console.log('[ArchivePage] Raw albums data:', data)

      const list: AlbumCardData[] = data.map((a: any) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        cover_image_url: a.cover_image_url,
        event_date: a.event_date,
        event_location: a.event_location,
        item_count: a.item_count || 0,
      }))

      console.log(`[ArchivePage] Loaded ${list.length} albums:`, list.map(a => ({ id: a.id, title: a.title, item_count: a.item_count })))
      setAlbums(list)
      setFilteredAlbums(list)

      // Sign cover images if stored in Supabase
      const coverUrls = list
        .map(a => a.cover_image_url)
        .filter((url: string | undefined) => url && url.includes('supabase')) as string[]

      if (coverUrls.length > 0) {
        console.log(`[ArchivePage] Signing ${coverUrls.length} cover image URLs`)
        try {
          const signedUrlResults = await getSignedUrls(coverUrls)
          const urlMap = createSignedUrlMap(signedUrlResults)
          setSignedUrlMap(urlMap)
        } catch (signError) {
          console.warn('[ArchivePage] Error signing URLs:', signError)
          // Don't fail the whole load if signing fails
        }
      }
    } catch (error) {
      console.error('[ArchivePage] Error fetching constellation items:', error)
      console.error('[ArchivePage] Error details:', error instanceof Error ? error.message : error)
      // Set empty arrays on error so UI shows "no albums" instead of infinite loading
      setAlbums([])
      setFilteredAlbums([])
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
    if (isClient) {
      loadConstellationItems()
    }
  }, [isClient])

  const handleUploadComplete = () => {
    // Refresh list after upload (albums may change if covers set later)
    loadConstellationItems()
  }

  const handleDeleteItem = (id: string) => {
    // Legacy for modal path; noop in albums grid
    setIsModalOpen(false)
    setSelectedItem(null)
  }

  const handleUpdateItem = (_updatedItem: ArchiveItem) => {
    // Albums grid view does not edit items here
  }

  // Search albums by title/description/location
  const filterAlbums = (list: AlbumCardData[], query: string) => {
    let filtered = list
    if (query.trim()) {
      const s = query.toLowerCase()
      filtered = list.filter(a =>
        a.title.toLowerCase().includes(s) ||
        (a.description?.toLowerCase().includes(s) ?? false) ||
        (a.event_location?.toLowerCase().includes(s) ?? false)
      )
    }
    setFilteredAlbums(filtered)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    filterAlbums(albums, query)
  }

  const handleTagFilter = (_tag: string) => {
    // Tags not used in albums grid yet
  }

  // Get all unique tags for filtering
  const getAllTags = () => [] as string[]

  if (loading || !isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-space-whale-lavender/20 via-white to-space-whale-purple/10">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-8 w-48 bg-gray-200/70 rounded animate-pulse mb-2" />
            <div className="h-4 w-96 bg-gray-200/70 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
                <div className="h-60 bg-gray-200/70 animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-4 w-2/3 bg-gray-200/70 rounded animate-pulse" />
                  <div className="h-3 w-full bg-gray-200/70 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-200/70 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </main>
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

        {/* Search */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-space-whale-purple" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search albums by title, description, or location..."
                className="w-full pl-10 pr-4 py-3 border border-space-whale-lavender/30 rounded-lg bg-white/80 backdrop-blur-sm text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent font-space-whale-body"
              />
            </div>
          </div>
        </div>

        {/* Albums Grid */}
        {filteredAlbums.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlbums.map((album) => (
              <Link key={album.id} href={`/albums/${album.id}`} className="block">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer rainbow-border-soft">
                  <div className="relative">
                    {album.cover_image_url ? (
                      <img
                        src={signedUrlMap[album.cover_image_url] || album.cover_image_url}
                        alt={album.title}
                        className="w-full h-60 object-cover rounded-t-xl"
                        loading="lazy"
                        decoding="async"
                        width={400}
                        height={240}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.parentElement!.innerHTML = `
                            <div class=\"w-full h-60 bg-gradient-to-br from-space-whale-lavender/30 to-space-whale-purple/30 flex items-center justify-center rounded-t-xl\">
                              <span class=\"text-4xl\">📁</span>
                            </div>
                          `
                        }}
                      />
                    ) : (
                      <div className="w-full h-60 bg-gradient-to-br from-space-whale-lavender/30 to-space-whale-purple/30 flex items-center justify-center rounded-t-xl">
                        <span className="text-4xl">📁</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-space-whale-heading text-space-whale-navy group-hover:text-space-whale-purple transition-colors">
                        {album.title}
                      </h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-space-whale-lavender/20 text-space-whale-purple font-space-whale-body">
                        {album.item_count} items
                      </span>
                    </div>
                    {album.description && (
                      <p className="text-sm text-space-whale-navy/70 font-space-whale-body line-clamp-2 mb-2">{album.description}</p>
                    )}
                    <div className="flex items-center text-sm text-space-whale-navy/60 font-space-whale-body gap-4">
                      {album.event_date && (
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{album.event_date}</span>
                      )}
                      {album.event_location && (
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{album.event_location}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🐋</div>
              {searchQuery ? (
                <>
                  <h3 className="text-xl font-space-whale-heading text-space-whale-navy mb-2">
                    No albums found
                  </h3>
                  <p className="text-space-whale-navy/70 font-space-whale-body mb-6">
                    Try adjusting your search terms to find what you're looking for.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setFilteredAlbums(albums)
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 transition-all duration-300 font-space-whale-accent"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-space-whale-heading text-space-whale-navy mb-2">
                    No albums yet
                  </h3>
                  <p className="text-space-whale-navy/70 font-space-whale-body mb-6">
                    Albums created by admins will appear here for everyone to explore.
                  </p>
                  <ArchiveUpload onUploadComplete={handleUploadComplete} />
                </>
              )}
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
