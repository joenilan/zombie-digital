"use client"

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation } from '@/components/navigation/Navigation'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Don't animate dashboard sub-pages
  const isDashboardSubPage = pathname.split('/').filter(Boolean).length > 1 && pathname.startsWith('/dashboard')
  
  // Show navbar on all other pages
  return (
    <div className="relative min-h-screen pb-20 sm:pb-0">
      <Navigation />
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