import AlbumManager from '@/components/archive/AlbumManager'

export default function AdminAlbumsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-space-whale-lavender/20 via-white to-space-whale-purple/10">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <a href="/" className="text-space-whale-purple hover:text-space-whale-navy font-space-whale-accent">← Back to Portal</a>
        </div>
        <AlbumManager />
      </main>
    </div>
  )
}
