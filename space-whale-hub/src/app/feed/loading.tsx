import AppShell from '@/components/layout/AppShell'

export default function FeedLoading() {
  return (
    <AppShell
      showDesktopNav
      logoSize="sm"
      backgroundImage="/fun-stars.png"
      backgroundOpacity={0.28}
      mainClassName="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 md:pb-8"
    >
      <div className="mb-8 space-y-3">
        <div className="h-8 w-48 bg-space-whale-lavender/20 rounded-lg animate-pulse" />
        <div className="h-4 w-full max-w-xl bg-space-whale-lavender/15 rounded animate-pulse" />
        <div className="h-10 w-28 bg-space-whale-navy/10 rounded-full animate-pulse" />
      </div>
      <div className="space-y-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-lofi-card rounded-xl p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-space-whale-lavender/25" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-28 bg-space-whale-lavender/25 rounded" />
                <div className="h-3 w-20 bg-space-whale-lavender/15 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-space-whale-lavender/15 rounded" />
              <div className="h-4 w-2/3 bg-space-whale-lavender/15 rounded" />
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  )
}
