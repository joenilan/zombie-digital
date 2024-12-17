'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { Suspense } from 'react'

function LoadingPlaceholder() {
  return (
    <div className="w-full h-full min-h-[400px] rounded-xl bg-glass/50 animate-pulse">
      <div className="p-8 space-y-4">
        <div className="h-8 w-1/3 bg-glass rounded-lg" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-glass rounded-lg" />
          <div className="h-4 w-5/6 bg-glass rounded-lg" />
          <div className="h-4 w-4/6 bg-glass rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default function ContentTransition({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{
          duration: 0.2,
          ease: 'easeInOut'
        }}
        className="h-full"
      >
        <Suspense fallback={<LoadingPlaceholder />}>
          {children}
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
} 