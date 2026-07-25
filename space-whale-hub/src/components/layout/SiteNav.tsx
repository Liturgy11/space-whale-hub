'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import UserProfile from '@/components/UserProfile'

const ADMIN_EMAIL = 'lizwamc@gmail.com'

const desktopNavLinks = [
  { href: '/archive', label: 'Constellation' },
  { href: '/feed', label: 'Community Orbit' },
  { href: '/workshops', label: 'Deep Space' },
  { href: '/personal', label: 'Inner Space' },
  { href: '/about', label: 'About' },
] as const

interface SiteNavProps {
  title?: string
  linkHome?: boolean
  showDesktopNav?: boolean
  showUserProfile?: boolean
  navActions?: React.ReactNode
  navClassName?: string
  logoSize?: 'sm' | 'md'
}

export default function SiteNav({
  title = 'Space Whale Portal',
  linkHome = true,
  showDesktopNav = false,
  showUserProfile = false,
  navActions,
  navClassName = 'bg-white/80 backdrop-blur-sm border-b border-space-whale-lavender/20 sticky top-0 z-50',
  logoSize = 'md',
}: SiteNavProps) {
  const { user } = useAuth()
  const isAdmin = user?.email === ADMIN_EMAIL

  const logoWidth = logoSize === 'sm' ? 28 : 32
  const logoHeight = logoSize === 'sm' ? 28 : 32
  const logoClassName =
    logoSize === 'sm'
      ? 'rounded-full sm:w-8 sm:h-8 cursor-pointer'
      : 'rounded-full cursor-pointer'
  const titleClassName =
    logoSize === 'sm'
      ? 'text-lg sm:text-xl font-space-whale-heading text-space-whale-navy'
      : 'text-xl font-space-whale-heading text-space-whale-navy'

  const brand = (
    <>
      <Image
        src="/Space Whale_Social Only.jpg"
        alt="Space Whale Logo - Click to return home"
        width={logoWidth}
        height={logoHeight}
        className={logoClassName}
      />
      <span className={titleClassName}>{title}</span>
    </>
  )

  return (
    <nav className={navClassName}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className={`flex items-center ${logoSize === 'sm' ? 'space-x-2 sm:space-x-4' : 'space-x-4'}`}
            suppressHydrationWarning={title === 'Constellation'}
          >
            {linkHome ? (
              <Link
                href="/"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                {brand}
              </Link>
            ) : (
              <div className="flex items-center space-x-2">{brand}</div>
            )}
          </div>

          {showDesktopNav && (
            <div className="hidden md:flex space-x-8">
              {desktopNavLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-space-whale-navy hover:text-space-whale-purple transition-colors font-space-whale-accent"
                >
                  {label}
                </Link>
              ))}
              {isAdmin && (
                <>
                  <Link
                    href="/admin"
                    className="text-space-whale-navy hover:text-space-whale-purple transition-colors font-space-whale-accent"
                  >
                    Admin
                  </Link>
                  <Link
                    href="/admin/albums"
                    className="text-space-whale-navy hover:text-space-whale-purple transition-colors font-space-whale-accent"
                  >
                    Albums
                  </Link>
                </>
              )}
            </div>
          )}

          {(showUserProfile || navActions) && (
            <div className="flex items-center space-x-2 sm:space-x-4">
              {navActions}
              {showUserProfile && <UserProfile />}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
