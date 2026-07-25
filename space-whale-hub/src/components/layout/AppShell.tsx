import SiteNav from './SiteNav'
import SiteFooter from './SiteFooter'

interface AppShellProps {
  children: React.ReactNode
  title?: string
  linkHome?: boolean
  showDesktopNav?: boolean
  showUserProfile?: boolean
  navActions?: React.ReactNode
  navClassName?: string
  logoSize?: 'sm' | 'md'
  className?: string
  style?: React.CSSProperties
  backgroundImage?: string
  backgroundOpacity?: number
  backgroundOverlay?: React.ReactNode
  mainClassName?: string
  contentWrapperClassName?: string
  showFooter?: boolean
  afterMain?: React.ReactNode
  wrapMain?: boolean
}

export default function AppShell({
  children,
  title,
  linkHome = true,
  showDesktopNav = false,
  showUserProfile = false,
  navActions,
  navClassName,
  logoSize = 'md',
  className = 'min-h-screen bg-white',
  style,
  backgroundImage,
  backgroundOpacity = 0.38,
  backgroundOverlay,
  mainClassName = 'relative z-10',
  contentWrapperClassName,
  showFooter = false,
  afterMain,
  wrapMain = true,
}: AppShellProps) {
  const content = wrapMain ? (
    <main className={mainClassName}>{children}</main>
  ) : (
    <div className={mainClassName}>{children}</div>
  )

  return (
    <div className={className} style={style}>
      {backgroundImage && (
        <div
          className="fixed inset-0 bg-cover bg-center pointer-events-none z-0"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            opacity: backgroundOpacity,
          }}
        />
      )}

      {backgroundOverlay}

      <SiteNav
        title={title}
        linkHome={linkHome}
        showDesktopNav={showDesktopNav}
        showUserProfile={showUserProfile}
        navActions={navActions}
        navClassName={navClassName}
        logoSize={logoSize}
      />

      {contentWrapperClassName ? (
        <div className={contentWrapperClassName}>{content}</div>
      ) : (
        content
      )}

      {afterMain}

      {showFooter && <SiteFooter />}
    </div>
  )
}
