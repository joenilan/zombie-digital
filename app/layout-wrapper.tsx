"use client"

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Navigation } from '@/components/navigation/Navigation'
import { Footer } from '@/components/Footer'
import { useAuthStore } from '@/stores/useAuthStore'
import { ScrollIndicator } from '@/components/ui/back-to-top'
import { KeyboardShortcuts } from '@/components/ui/keyboard-shortcuts'
import { TooltipProvider } from '@/components/ui/tooltip'

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
    !pathname.startsWith('/terms') &&
    !pathname.startsWith('/emote-studio');

  // Don't show navigation/footer on overlay, canvas pages, or username pages
  if (isOverlay || isCanvas || isUsernamePage) {
    return (
      <TooltipProvider>
        {children}
      </TooltipProvider>
    );
  }

  // All pages get normal scrolling layout with fixed footer
  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main id="main-content" className="relative z-10 flex-1">
          {children}
        </main>
        <Footer />

        {/* Add scroll indicator and back to top for all pages except overlay/canvas */}
        <ScrollIndicator
          threshold={400}
          showProgress={true}
          variant="cyber"
        />
        <KeyboardShortcuts />
      </div>
    </TooltipProvider>
  )
} 