"use client"

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Navigation } from '@/components/navigation/Navigation'
import { Footer } from '@/components/Footer'
import { useAuthStore } from '@/stores/useAuthStore'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isOverlay = pathname.startsWith('/overlay')
  const isCanvas = pathname.startsWith('/canvas/') && !pathname.endsWith('/settings')
  const isHomepage = pathname === '/'
  const isAdmin = pathname.startsWith('/admin')
  const { initialize, isInitialized } = useAuthStore()

  // Initialize auth store on app start
  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

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
    !pathname.includes('.') &&
    !pathname.startsWith('/about') &&
    !pathname.startsWith('/contact') &&
    !pathname.startsWith('/privacy') &&
    !pathname.startsWith('/terms');

  // Don't show navigation/footer on overlay, canvas pages, or username pages
  if (isOverlay || isCanvas || isUsernamePage) {
    return children;
  }

  // Homepage gets special centered layout - single page, non-scrollable
  if (isHomepage) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Navigation />
        <main className="flex-1 flex items-center justify-center overflow-hidden">
          {children}
        </main>
        <Footer />
      </div>
    )
  }

  // All other pages get normal scrolling layout with FIXED footer
  return (
    <div className="relative">
      <Navigation />
      <main className="pb-16">
        {children}
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <Footer />
      </div>
    </div>
  )
} 