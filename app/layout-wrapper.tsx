"use client"

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Navbar from '@/components/Navbar'
import { motion, AnimatePresence } from 'framer-motion'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Hide navbar on overlay routes and profile pages
  if (pathname.startsWith('/overlay/')) {
    return (
      <AnimatePresence mode="wait">
        <motion.div 
          key={pathname}
          className="relative min-h-screen"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    )
  }

  // Check if we're on a profile page (single segment that's not a system route)
  const segments = pathname.split('/').filter(Boolean)
  const isProfilePage = segments.length === 1 && 
    !['dashboard', 'admin', 'auth', 'canvas', 'overlay', 'docs'].includes(segments[0])

  if (isProfilePage) {
    return (
      <AnimatePresence mode="wait">
        <motion.div 
          key={pathname}
          className="relative min-h-screen"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    )
  }

  // Don't animate dashboard sub-pages
  const isDashboardSubPage = pathname.split('/').filter(Boolean).length > 1 && pathname.startsWith('/dashboard')
  
  // Show navbar on all other pages
  return (
    <div className="relative min-h-screen">
      <Navbar />
      {isDashboardSubPage ? (
        <div className="relative">
          {children}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div 
            key={pathname}
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
} 