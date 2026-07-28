import Image from 'next/image'

interface SpaceIllustrationProps {
  src: string
  className?: string
}

export function SpaceIllustration({ src, className = 'h-10 w-10' }: SpaceIllustrationProps) {
  return (
    <Image
      src={src}
      alt=""
      width={80}
      height={80}
      aria-hidden
      className={`object-contain ${className}`}
    />
  )
}

interface EmptyStateProps {
  iconSrc: string
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
  bordered?: boolean
}

export default function EmptyState({
  iconSrc,
  title,
  description,
  children,
  className = '',
  bordered = true,
}: EmptyStateProps) {
  return (
    <div
      className={`text-center py-12 sm:py-16 px-4 ${
        bordered ? 'bg-lofi-card rounded-xl shadow-lg rainbow-border-soft' : ''
      } ${className}`}
    >
      <SpaceIllustration
        src={iconSrc}
        className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-4 sm:mb-6 animate-float"
      />
      <h3 className="text-xl sm:text-2xl font-space-whale-heading text-space-whale-navy mb-3">
        {title}
      </h3>
      {description && (
        <p className="text-base sm:text-lg text-space-whale-navy/80 font-space-whale-body mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      {children}
    </div>
  )
}
