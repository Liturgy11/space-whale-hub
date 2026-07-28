import Image from 'next/image'

interface SpacePageHeaderProps {
  iconSrc: string
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

export default function SpacePageHeader({
  iconSrc,
  title,
  description,
  actions,
  className = 'mb-6 sm:mb-8',
  children,
}: SpacePageHeaderProps) {
  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Image
              src={iconSrc}
              alt=""
              width={40}
              height={40}
              aria-hidden
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain flex-shrink-0"
            />
            <h1 className="text-2xl sm:text-3xl font-space-whale-heading text-space-whale-navy">
              {title}
            </h1>
          </div>
          {description && (
            <p className="text-base sm:text-lg font-space-whale-body text-space-whale-navy">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex-shrink-0 w-full sm:w-auto">{actions}</div>}
      </div>
      {children}
    </div>
  )
}
