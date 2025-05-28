"use client"

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Navigation } from '@/components/navigation/Navigation'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isOverlay = pathname.startsWith('/overlay')
  const isCanvas = pathname.startsWith('/canvas/') && !pathname.endsWith('/settings')

  // Ensure page loads at top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Check if this is a username route (public social links page)
  // A username route has a single segment and doesn't match other known routes
  const isUsernamePage = pathname.startsWith('/') &&
    pathname.split('/').length === 2 &&
    pathname !== '/' &&
    !pathname.startsWith('/dashboard') &&
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/canvas') &&
    !pathname.startsWith('/overlay') &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next') &&
    !pathname.includes('.');

  // Don't show navigation on overlay, canvas pages, or username pages
  if (isOverlay || isCanvas || isUsernamePage) {
    return children;
  }

  return (
    <div className="relative min-h-screen">
      <Navigation />
      <div className="pb-20 sm:pb-0">
        {children}
      </div>
    </div>
  )
} 