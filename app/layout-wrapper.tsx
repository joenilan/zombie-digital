"use client"

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/navigation/Navigation'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isOverlay = pathname.startsWith('/overlay')
  const isCanvas = pathname.startsWith('/canvas/') && !pathname.endsWith('/settings')

  // Check if this is a username route (public social links page)
  // A username route has a single segment and doesn't match other known routes
  const isUsernamePage = (
    pathname.split('/').filter(Boolean).length === 1 &&
    !pathname.startsWith('/dashboard') &&
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/auth') &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/docs') &&
    pathname !== '/'
  )

  // Log for debugging
  console.log(`Path: ${pathname}, Is username page: ${isUsernamePage}`);

  // Don't show navigation on overlay, canvas pages, or username pages
  if (isOverlay || isCanvas || isUsernamePage) {
    return children;
  }

  return (
    <div className="relative min-h-screen pb-20 sm:pb-0">
      <Navigation />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        {children}
      </motion.div>
    </div>
  )
} 