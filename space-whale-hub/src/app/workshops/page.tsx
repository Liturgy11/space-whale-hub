import { Suspense } from 'react'
import AppShell from '@/components/layout/AppShell'
import DeepSpaceTabs from '@/components/deep-space/DeepSpaceTabs'

export default function Workshops() {
  return (
    <AppShell
      showDesktopNav
      showUserProfile
      className="min-h-screen bg-white relative"
      backgroundImage="/vivid-mushrooms.png"
      backgroundOpacity={0.12}
      navClassName="relative z-10 bg-white/80 backdrop-blur-sm border-b border-space-whale-lavender/20 sticky top-0 z-50"
      mainClassName="relative z-10"
    >
      <Suspense fallback={null}>
        <DeepSpaceTabs />
      </Suspense>
    </AppShell>
  )
}
