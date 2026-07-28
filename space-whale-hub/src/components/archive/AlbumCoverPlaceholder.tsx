import { SpaceIllustration } from '@/components/ui/EmptyState'
import { SPACE_ILLUSTRATIONS } from '@/lib/space-illustrations'

interface AlbumCoverPlaceholderProps {
  className?: string
  roundedClassName?: string
  iconClassName?: string
}

export default function AlbumCoverPlaceholder({
  className = 'h-60',
  roundedClassName = 'rounded-t-xl',
  iconClassName = 'h-12 w-12 sm:h-14 sm:w-14',
}: AlbumCoverPlaceholderProps) {
  return (
    <div
      className={`w-full ${className} bg-gradient-to-br from-space-whale-lavender/30 to-space-whale-purple/30 flex items-center justify-center ${roundedClassName}`}
    >
      <SpaceIllustration src={SPACE_ILLUSTRATIONS.constellation} className={iconClassName} />
    </div>
  )
}
