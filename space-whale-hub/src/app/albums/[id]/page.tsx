'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, GripVertical } from 'lucide-react'
import { getSignedUrls, createSignedUrlMap } from '@/lib/signed-urls'
import ArchiveItemModal from '@/components/archive/ArchiveItemModal'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/components/ui/Toast'

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

interface AlbumInfo {
  id: string
  title: string
  description?: string
  cover_image_url?: string
  event_date?: string
  event_location?: string
  item_count?: number
}

export default function AlbumDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const albumId = params?.id
  const { user } = useAuth()

  const [album, setAlbum] = useState<AlbumInfo | null>(null)
  const [items, setItems] = useState<ArchiveItem[]>([])
  const [loading, setLoading] = useState(true)
  const [signedUrlMap, setSignedUrlMap] = useState<Record<string, string>>({})
  const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const isAdmin = user?.email === 'lizwamc@gmail.com'

  useEffect(() => {
    if (!albumId) return

    const load = async () => {
      try {
        setLoading(true)

        // Fetch album list and pick this album (no dedicated single endpoint yet)
        const [albumsRes, itemsRes] = await Promise.all([
          fetch('/api/get-albums-secure'),
          fetch(`/api/get-album-items-secure?albumId=${albumId}`)
        ])

        const albumsJson = await albumsRes.json()
        const itemsJson = await itemsRes.json()

        if (!albumsJson.success) throw new Error(albumsJson.error || 'Failed to load album')
        if (!itemsJson.success) throw new Error(itemsJson.error || 'Failed to load items')

        const found = (albumsJson.data as AlbumInfo[]).find(a => a.id === albumId) || null
        setAlbum(found)

        // API returns { success, data: { album, items } }
        const itemsPayload = itemsJson?.data?.items ?? itemsJson?.items ?? itemsJson?.data
        const itemsArray: ArchiveItem[] = Array.isArray(itemsPayload) ? itemsPayload : []

        setItems(itemsArray)

        // Sign media URLs for items
        const mediaUrls = itemsArray
          .map((it: ArchiveItem) => it.media_url)
          .filter((url: string) => url && url.includes('supabase'))

        if (mediaUrls.length > 0) {
          const signed = await getSignedUrls(mediaUrls)
          setSignedUrlMap(createSignedUrlMap(signed))
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [albumId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-space-whale-lavender/20 via-white to-space-whale-purple/10">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-space-whale-purple hover:text-space-whale-navy font-space-whale-accent"
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Back
          </button>
        </div>

        {loading ? (
          <div className="text-center py-24">Loading album…</div>
        ) : !album ? (
          <div className="text-center py-24">Album not found.</div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-space-whale-lavender/20 mb-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  {album.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={signedUrlMap[album.cover_image_url] || album.cover_image_url}
                      alt={album.title}
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-space-whale-lavender/30 to-space-whale-purple/30 rounded-xl flex items-center justify-center">
                      <span className="text-4xl">📁</span>
                    </div>
                  )}
                </div>
                <div className="md:flex-1">
                  <h1 className="text-3xl font-space-whale-heading text-space-whale-navy mb-2">{album.title}</h1>
                  {album.description && (
                    <p className="text-space-whale-navy/70 font-space-whale-body mb-3">{album.description}</p>
                  )}
                  <div className="flex items-center gap-6 text-sm text-space-whale-navy/60 font-space-whale-body">
                    {album.event_date && (
                      <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{album.event_date}</span>
                    )}
                    {album.event_location && (
                      <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{album.event_location}</span>
                    )}
                    <span>{items.length} items</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Grid */}
            {items.length > 0 ? (
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                {...(isAdmin ? {
                  onDragOver: (e: React.DragEvent) => e.preventDefault()
                } : {})}
              >
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    draggable={isAdmin}
                    onDragStart={(e) => {
                      if (!isAdmin) return
                      e.dataTransfer.setData('text/plain', String(index))
                    }}
                    onDrop={async (e) => {
                      if (!isAdmin) return
                      e.preventDefault()
                      const fromIndex = Number(e.dataTransfer.getData('text/plain'))
                      const toIndex = index
                      if (Number.isNaN(fromIndex) || fromIndex === toIndex) return
                      // Reorder locally
                      const newItems = [...items]
                      const [moved] = newItems.splice(fromIndex, 1)
                      newItems.splice(toIndex, 0, moved)
                      setItems(newItems)
                      // Persist order
                      try {
                        const orders = newItems.map((it, i) => ({ item_id: it.id, sort_order: i }))
                        await fetch('/api/manage-album-items-secure', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ album_id: albumId, orders })
                        })
                      } catch (err) {
                        console.error('Failed to save order', err)
                      }
                    }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden rainbow-border-soft cursor-pointer hover:shadow-xl transition relative"
                    onClick={() => { setSelectedItem(item); setSelectedIndex(index); setIsModalOpen(true) }}
                  >
                    <div className="relative">
                      {item.content_type === 'video' ? (
                        // eslint-disable-next-line jsx-a11y/media-has-caption
                        <video
                          src={signedUrlMap[item.media_url] || item.media_url}
                          className="w-full aspect-video object-cover"
                          controls
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={signedUrlMap[item.media_url] || item.media_url}
                          alt={item.title}
                          className="w-full h-60 object-contain bg-space-whale-lavender/10"
                          loading="lazy"
                          decoding="async"
                          width={400}
                          height={240}
                        />
                      )}

                      {/* Cover badge */}
                      {album?.cover_image_url === item.media_url && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 text-xs rounded-md bg-space-whale-purple text-white/90 font-space-whale-body">
                          Cover
                        </span>
                      )}

                      {/* Admin-only: drag handle */}
                      {isAdmin && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md bg-white/90 border border-space-whale-lavender/30 text-space-whale-navy">
                          <GripVertical className="h-4 w-4" />
                          <span className="text-xs font-space-whale-body">Drag</span>
                        </div>
                      )}

                      {/* Admin-only: Set as Cover */}
                      {isAdmin && (
                        <button
                          className="absolute top-2 right-2 px-3 py-1 text-xs rounded-md bg-white/90 border border-space-whale-lavender/30 text-space-whale-navy hover:bg-space-whale-lavender/20 font-space-whale-body"
                          onClick={async (e) => {
                            e.stopPropagation()
                            try {
                              const res = await fetch('/api/update-album-secure', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: albumId, title: album?.title, description: album?.description, cover_image_url: item.media_url, event_date: album?.event_date, event_location: album?.event_location, is_featured: false, sort_order: 0 })
                              })
                              const json = await res.json()
                              if (!json.success) throw new Error(json.error)
                              setAlbum(prev => prev ? { ...prev, cover_image_url: item.media_url } : prev)
                            } catch (err: any) {
                              console.error('Failed to set cover:', err)
                              toast(err.message || 'Failed to set album cover', 'error')
                            }
                          }}
                        >
                          Set as cover
                        </button>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-space-whale-heading text-space-whale-navy mb-1">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-space-whale-navy/70 font-space-whale-body line-clamp-2">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24">No items in this album yet.</div>
            )}
          </>
        )}

        <div className="mt-10 text-center">
          <Link href="/archive" className="text-space-whale-purple hover:text-space-whale-navy font-space-whale-accent">
            Explore more albums →
          </Link>
        </div>
      </main>

      {/* Archive Item Modal */}
      <ArchiveItemModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedItem(null) }}
        items={items}
        startIndex={selectedIndex}
      />
    </div>
  )
}


