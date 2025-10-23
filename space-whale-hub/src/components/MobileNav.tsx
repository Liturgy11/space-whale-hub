'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Home, User, Heart, Archive, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileNav() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      active: pathname === '/'
    },
    {
      name: 'Personal',
      href: '/personal',
      icon: User,
      active: pathname === '/personal'
    },
    {
      name: 'Community',
      href: '/feed',
      icon: Heart,
      active: pathname === '/feed'
    },
    {
      name: 'Archive',
      href: '/archive',
      icon: Archive,
      active: pathname === '/archive'
    }
  ]

  if (!user) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 dark:bg-gray-900/95 dark:border-gray-700 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                item.active
                  ? 'text-space-whale-purple bg-space-whale-lavender/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-space-whale-purple'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
        
        {/* Settings/Profile dropdown */}
        <div className="flex flex-col items-center space-y-1 px-3 py-2">
          <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">More</span>
        </div>
      </div>
    </div>
  )
}
