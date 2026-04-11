'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ArchivePage from '@/components/archive/ArchivePage'
import MycelialNetwork from './MycelialNetwork'
import SporeForm from './SporeForm'
import { X } from 'lucide-react'

export default function ConstellationTabs() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<'archive' | 'network'>('archive')

  useEffect(() => {
    if (searchParams.get('tab') === 'network') {
      setTab('network')
    }
  }, [searchParams])
  const [showSporeForm, setShowSporeForm] = useState(false)
  const [sporeKey, setSporeKey] = useState(0) // bump to re-fetch network after save
  const [currentSpore, setCurrentSpore] = useState<any>(null)

  return (
    <div>
      {/* Tab bar */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-space-whale-lavender/20">
        <div className="max-w-5xl mx-auto px-4 flex gap-0">
          <button
            onClick={() => setTab('archive')}
            className={`px-6 py-3.5 text-sm font-space-whale-accent transition-all border-b-2 ${
              tab === 'archive'
                ? 'border-space-whale-purple text-space-whale-purple'
                : 'border-transparent text-space-whale-navy/60 hover:text-space-whale-navy'
            }`}
          >
            ✦ Archive
          </button>
          <button
            onClick={() => setTab('network')}
            className={`px-6 py-3.5 text-sm font-space-whale-accent transition-all border-b-2 ${
              tab === 'network'
                ? 'border-space-whale-purple text-space-whale-purple'
                : 'border-transparent text-space-whale-navy/60 hover:text-space-whale-navy'
            }`}
          >
            🍄 Mycelial Network
          </button>
        </div>
      </div>

      {/* Tab content */}
      {tab === 'archive' && <ArchivePage />}

      {tab === 'network' && (
        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-space-whale-heading text-space-whale-navy mb-2">Mycelial Network</h2>
            <p className="text-sm text-space-whale-purple/80 font-space-whale-body max-w-lg mx-auto">
              An invisible web of gifts and curiosities connecting this community. 
              Explore the threads. Find your resonances. Arrive when you are ready.
            </p>
          </div>

          {/* Spore form modal */}
          {showSporeForm && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
              onClick={() => setShowSporeForm(false)}
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-end mb-2">
                  <button onClick={() => setShowSporeForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <SporeForm
                  existingSpore={currentSpore}
                  onSaved={() => {
                    setShowSporeForm(false)
                    setSporeKey(k => k + 1)
                  }}
                  onCancel={() => setShowSporeForm(false)}
                />
              </div>
            </div>
          )}

          {/* Network viz */}
          <div className="relative rounded-2xl border border-space-whale-lavender/20 overflow-hidden shadow-sm">
            {/* Forest background artwork */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: 'url(/forest-background.png)',
                opacity: 0.5,
              }}
            />
            <div className="relative">
              <MycelialNetwork
                key={sporeKey}
                currentUserId={user?.id}
                onEditSpore={() => setShowSporeForm(true)}
                onCurrentSporeLoaded={setCurrentSpore}
              />
            </div>
          </div>

          {/* Invite to join — only if not in network yet */}
          {user && (
            <div className="mt-6 text-center">
              <p className="text-xs text-space-whale-purple/60 font-space-whale-body">
                Place yourself in the forest whenever you feel ready —{' '}
                <button
                  onClick={() => setShowSporeForm(true)}
                  className="underline underline-offset-2 hover:text-space-whale-purple transition-colors"
                >
                  add your spore
                </button>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
