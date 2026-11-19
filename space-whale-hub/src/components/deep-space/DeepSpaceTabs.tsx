'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import SpacePageHeader from '@/components/layout/SpacePageHeader'
import GatheringsPanel from './GatheringsPanel'
import ResourcesPanel from './ResourcesPanel'

type DeepSpaceTab = 'gatherings' | 'resources'

export default function DeepSpaceTabs() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [tab, setTab] = useState<DeepSpaceTab>(() =>
    searchParams.get('tab') === 'resources' ? 'resources' : 'gatherings'
  )

  useEffect(() => {
    setTab(searchParams.get('tab') === 'resources' ? 'resources' : 'gatherings')
  }, [searchParams])

  const selectTab = (next: DeepSpaceTab) => {
    setTab(next)
    const params = new URLSearchParams(searchParams.toString())
    if (next === 'gatherings') {
      params.delete('tab')
    } else {
      params.set('tab', next)
    }
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <SpacePageHeader
          iconSrc="/illustrations/whale.png"
          title="Deep Space"
          description="Gatherings and resources for the journey — live sessions now, courses and self-paced learning to come."
          className="mb-4 sm:mb-6"
        />
      </div>

      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-space-whale-lavender/20">
        <div className="max-w-3xl mx-auto px-4 flex gap-0">
          <button
            type="button"
            onClick={() => selectTab('gatherings')}
            className={`px-6 py-3.5 text-sm font-space-whale-accent transition-all border-b-2 ${
              tab === 'gatherings'
                ? 'border-space-whale-purple text-space-whale-purple'
                : 'border-transparent text-space-whale-navy/60 hover:text-space-whale-navy'
            }`}
          >
            Gatherings
          </button>
          <button
            type="button"
            onClick={() => selectTab('resources')}
            className={`px-6 py-3.5 text-sm font-space-whale-accent transition-all border-b-2 ${
              tab === 'resources'
                ? 'border-space-whale-purple text-space-whale-purple'
                : 'border-transparent text-space-whale-navy/60 hover:text-space-whale-navy'
            }`}
          >
            Resources
          </button>
        </div>
      </div>

      {tab === 'gatherings' && <GatheringsPanel />}
      {tab === 'resources' && <ResourcesPanel />}
    </div>
  )
}
