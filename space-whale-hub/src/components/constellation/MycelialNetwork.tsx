'use client'

import { useCallback, useEffect, useState, useMemo } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  NodeProps,
  Handle,
  Position,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Sparkles, X, MapPin, Heart, Star } from 'lucide-react'

interface Spore {
  user_id: string
  display_name: string
  avatar_url?: string
  bio?: string
  location?: string
  offerings: string[]
  curiosities: string[]
  connection_formats: string[]
}

interface Connection {
  source: string
  target: string
  type: 'shared_curiosity' | 'complementary' | 'shared_offering'
}

// Edge colours by connection type
const EDGE_COLORS = {
  complementary: '#c084fc',      // purple — offering meets curiosity
  shared_curiosity: '#f9a8d4',   // pink — shared curiosity
  shared_offering: '#6ee7b7',    // teal — shared skill
}

const EDGE_LABELS = {
  complementary: 'complementary',
  shared_curiosity: 'shared curiosity',
  shared_offering: 'shared offering',
}

// Custom spore node
function SporeNode({ data }: NodeProps) {
  const spore = data.spore as Spore
  const initials = spore.display_name
    ? spore.display_name.slice(0, 2).toUpperCase()
    : '🐋'

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div
        className="flex flex-col items-center cursor-pointer group"
        style={{ width: 72 }}
      >
        <div
          className="w-14 h-14 rounded-full border-2 border-space-whale-purple/60 shadow-lg overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:border-space-whale-purple group-hover:shadow-space-whale-purple/40 group-hover:shadow-xl"
          style={{
            background: spore.avatar_url
              ? undefined
              : 'linear-gradient(135deg, #a78bfa, #f472b6)',
          }}
        >
          {spore.avatar_url ? (
            <img src={spore.avatar_url} alt={spore.display_name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-bold text-sm">{initials}</span>
          )}
        </div>
        <span className="mt-1.5 text-xs font-medium text-space-whale-navy text-center leading-tight max-w-[72px] truncate">
          {spore.display_name || 'Space Whale'}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </>
  )
}

const nodeTypes = { spore: SporeNode }

// Simple radial layout
function computeLayout(spores: Spore[]): { id: string; x: number; y: number }[] {
  const n = spores.length
  if (n === 0) return []
  if (n === 1) return [{ id: spores[0].user_id, x: 0, y: 0 }]

  const positions: { id: string; x: number; y: number }[] = []
  const rings = [1, 6, 12, 18, 24]
  let placed = 0
  let ringIdx = 0
  const baseRadius = 180

  while (placed < n) {
    const capacity = rings[Math.min(ringIdx, rings.length - 1)]
    const radius = ringIdx === 0 ? 0 : baseRadius * ringIdx
    const count = Math.min(capacity, n - placed)

    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2
      positions.push({
        id: spores[placed].user_id,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      })
      placed++
    }
    ringIdx++
  }

  return positions
}

interface MycelialNetworkProps {
  currentUserId?: string
  onEditSpore?: () => void
  onCurrentSporeLoaded?: (spore: Spore | null) => void
}

export default function MycelialNetwork({ currentUserId, onEditSpore, onCurrentSporeLoaded }: MycelialNetworkProps) {
  const [spores, setSpores] = useState<Spore[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSpore, setSelectedSpore] = useState<Spore | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const fetchSpores = useCallback(async () => {
    try {
      const res = await fetch('/api/get-spores')
      const json = await res.json()
      if (json.success) {
        setSpores(json.spores)
        setConnections(json.connections)
        if (onCurrentSporeLoaded) {
          const mine = json.spores.find((s: Spore) => s.user_id === currentUserId) ?? null
          onCurrentSporeLoaded(mine)
        }
      }
    } catch (err) {
      console.error('Failed to load spores:', err)
    } finally {
      setLoading(false)
    }
  }, [currentUserId, onCurrentSporeLoaded])

  useEffect(() => { fetchSpores() }, [fetchSpores])

  // Build React Flow nodes + edges
  useEffect(() => {
    if (!spores.length) return

    const layout = computeLayout(spores)
    const layoutMap = new Map(layout.map(p => [p.id, p]))

    const newNodes: Node[] = spores.map(spore => {
      const pos = layoutMap.get(spore.user_id) || { x: 0, y: 0 }
      return {
        id: spore.user_id,
        type: 'spore',
        position: { x: pos.x + 400, y: pos.y + 300 },
        data: {
          spore,
          onClick: () => setSelectedSpore(spore),
        },
      }
    })

    const newEdges: Edge[] = connections.map((conn, i) => ({
      id: `edge-${i}`,
      source: conn.source,
      target: conn.target,
      animated: conn.type === 'complementary',
      style: {
        stroke: EDGE_COLORS[conn.type],
        strokeWidth: conn.type === 'complementary' ? 2.5 : 1.5,
        opacity: 0.7,
      },
      label: undefined,
      data: { type: conn.type },
    }))

    setNodes(newNodes)
    setEdges(newEdges)
  }, [spores, connections, setNodes, setEdges])

  const onNodeClick = useCallback((_: any, node: Node) => {
    const spore = spores.find(s => s.user_id === node.id)
    if (spore) setSelectedSpore(spore)
  }, [spores])

  const userHasSpore = spores.some(s => s.user_id === currentUserId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-float">🍄</div>
          <p className="text-space-whale-purple/70 font-space-whale-body text-sm">Growing the network…</p>
        </div>
      </div>
    )
  }

  if (spores.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-5xl mb-4">🌱</div>
          <h3 className="text-lg font-space-whale-heading text-space-whale-navy mb-2">The forest is waiting</h3>
          <p className="text-sm text-space-whale-purple/70 font-space-whale-body mb-6">
            Be the first to place yourself in the network. When you are ready.
          </p>
          {currentUserId && onEditSpore && (
            <button
              onClick={onEditSpore}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg text-sm font-space-whale-accent shadow-lg hover:opacity-90 transition-opacity"
            >
              <Sparkles className="h-4 w-4" />
              Place yourself in the forest
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full" style={{ height: '70vh', minHeight: 480 }}>
      {/* Legend */}
      <div className="absolute top-3 left-3 z-10 bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-space-whale-lavender/20 text-xs font-space-whale-body space-y-1.5">
        <p className="font-medium text-space-whale-navy mb-2">Connection threads</p>
        {Object.entries(EDGE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div className="w-5 h-0.5 rounded" style={{ backgroundColor: color }} />
            <span className="text-space-whale-navy/70 capitalize">{EDGE_LABELS[type as keyof typeof EDGE_LABELS]}</span>
          </div>
        ))}
      </div>

      {/* Edit / Add spore button */}
      {currentUserId && (
        <button
          onClick={onEditSpore}
          className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg text-xs font-space-whale-accent shadow-lg hover:opacity-90 transition-opacity"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {userHasSpore ? 'Edit my spore' : 'Add my spore'}
        </button>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        nodesDraggable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#a78bfa20"
        />
        <Controls showInteractive={false} className="bg-white/80 backdrop-blur-sm border-space-whale-lavender/20" />
      </ReactFlow>

      {/* Spore detail panel */}
      {selectedSpore && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm mx-auto px-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-space-whale-lavender/30 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                  style={{ background: selectedSpore.avatar_url ? undefined : 'linear-gradient(135deg, #a78bfa, #f472b6)' }}>
                  {selectedSpore.avatar_url ? (
                    <img src={selectedSpore.avatar_url} alt={selectedSpore.display_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-sm">
                      {selectedSpore.display_name?.slice(0, 2).toUpperCase() || '🐋'}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-space-whale-subheading text-space-whale-navy text-base">
                    {selectedSpore.display_name || 'Space Whale'}
                  </h3>
                  {selectedSpore.location && (
                    <p className="text-xs text-space-whale-purple/70 flex items-center gap-1 font-space-whale-body">
                      <MapPin className="h-3 w-3" />{selectedSpore.location}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedSpore(null)} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                <X className="h-4 w-4" />
              </button>
            </div>

            {selectedSpore.bio && (
              <p className="text-xs text-space-whale-navy/80 font-space-whale-body mb-3 leading-relaxed">{selectedSpore.bio}</p>
            )}

            <div className="space-y-2">
              {selectedSpore.offerings.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-space-whale-purple flex items-center gap-1 mb-1">
                    <Star className="h-3 w-3" /> Offerings
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedSpore.offerings.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-space-whale-lavender/30 text-space-whale-navy rounded-full text-xs">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedSpore.curiosities.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-accent-pink flex items-center gap-1 mb-1">
                    <Heart className="h-3 w-3" /> Curious about
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedSpore.curiosities.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-accent-pink/20 text-space-whale-navy rounded-full text-xs">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedSpore.connection_formats.length > 0 && (
                <p className="text-xs text-space-whale-purple/70 font-space-whale-body">
                  Connects via: {selectedSpore.connection_formats.join(' · ')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
