"use client"

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/navigation/Navigation'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isOverlay = pathname.startsWith('/overlay')
  const isCanvas = pathname.startsWith('/canvas/') && !pathname.endsWith('/settings')

  // Don't show navigation on overlay or canvas pages
  if (isOverlay || isCanvas) {
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