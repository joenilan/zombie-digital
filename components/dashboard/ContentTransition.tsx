'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { SkeletonForm } from '@/components/ui/skeleton'

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
        <Suspense fallback={<SkeletonForm />}>
          {children}
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
} 