'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Star, Orbit, CircleDotDashed, Eye, Info } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileNav() {
  const { user } = useAuth()
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Archive',
      shortName: 'Archive',
      href: '/archive',
      icon: Star,
      iconColor: 'text-purple-800',
      active: pathname === '/archive',
    },
    {
      name: 'Community',
      shortName: 'Orbit',
      href: '/feed',
      icon: Orbit,
      iconColor: 'text-yellow-500',
      active: pathname === '/feed',
    },
    {
      name: 'Deep Space',
      shortName: 'Deep',
      href: '/workshops',
      icon: CircleDotDashed,
      iconColor: 'text-cyan-500',
      active: pathname === '/workshops',
    },
    {
      name: 'Inner Space',
      shortName: 'Inner',
      href: '/personal',
      icon: Eye,
      iconColor: 'text-pink-400',
      active: pathname === '/personal',
    },
    {
      name: 'About',
      shortName: 'About',
      href: '/about',
      icon: Info,
      iconColor: 'text-gray-600 dark:text-gray-400',
      active: pathname === '/about',
    },
  ]

  if (!user) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 dark:bg-gray-900/95 dark:border-gray-700 md:hidden safe-area-inset-bottom">
      <div className="flex items-stretch justify-between px-0.5 py-1.5 max-w-screen-sm mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.active
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.name}
              title={item.name}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 px-0.5 min-w-0 rounded-lg transition-colors touch-manipulation ${
                isActive
                  ? 'bg-space-whale-lavender/20'
                  : 'hover:bg-space-whale-lavender/10 active:bg-space-whale-lavender/15'
              }`}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${item.iconColor} ${isActive ? 'opacity-100' : 'opacity-60'}`} />
              <span
                className={`text-[10px] font-medium leading-none text-center ${
                  isActive ? 'text-space-whale-purple' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {item.shortName}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
