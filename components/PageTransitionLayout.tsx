'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

// Enhanced transition variants for different page types
const pageVariants = {
  // Standard page transition
  standard: {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.98,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 1.02,
    }
  },

  // Slide transitions for navigation
  slideLeft: {
    initial: {
      opacity: 0,
      x: 100,
    },
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: -100,
    }
  },

  slideRight: {
    initial: {
      opacity: 0,
      x: -100,
    },
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: 100,
    }
  },

  // Fade transition for modals/overlays
  fade: {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    }
  },

  // Scale transition for dashboard pages
  scale: {
    initial: {
      opacity: 0,
      scale: 0.9,
    },
    animate: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: 1.1,
    }
  }
}

// Smooth, professional transition timing
const pageTransition = {
  duration: 0.4,
  ease: [0.25, 0.46, 0.45, 0.94], // Custom cubic-bezier for smooth feel
}

// Fast transition for quick navigation
const fastTransition = {
  duration: 0.2,
  ease: [0.25, 0.46, 0.45, 0.94],
}

// Stagger children animations for content
const containerVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    }
  }
}

// Loading overlay for slow transitions
const loadingVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

// Determine transition type based on route
function getTransitionType(pathname: string, previousPath?: string): keyof typeof pageVariants {
  // Dashboard pages use scale transition
  if (pathname.startsWith('/dashboard')) {
    return 'scale'
  }

  // Admin pages use slide transitions
  if (pathname.startsWith('/admin')) {
    return 'slideLeft'
  }

  // Modal/overlay pages use fade
  if (pathname.startsWith('/overlay') || pathname.includes('/settings')) {
    return 'fade'
  }

  // Navigation direction detection for slide transitions
  if (previousPath) {
    const routes = ['/', '/about', '/contact', '/dashboard', '/admin']
    const currentIndex = routes.findIndex(route => pathname.startsWith(route))
    const previousIndex = routes.findIndex(route => previousPath.startsWith(route))

    if (currentIndex > previousIndex) {
      return 'slideLeft'
    } else if (currentIndex < previousIndex) {
      return 'slideRight'
    }
  }

  // Default to standard transition
  return 'standard'
}

interface PageTransitionLayoutProps {
  children: React.ReactNode
  variant?: keyof typeof pageVariants
  showLoading?: boolean
  loadingDelay?: number
}

export default function PageTransitionLayout({
  children,
  variant,
  showLoading = false,
  loadingDelay = 300
}: PageTransitionLayoutProps) {
  const pathname = usePathname()
  const [previousPath, setPreviousPath] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)

  // Track route changes for transition direction
  useEffect(() => {
    if (previousPath !== pathname) {
      if (showLoading) {
        setIsLoading(true)
        const timer = setTimeout(() => setIsLoading(false), loadingDelay)
        return () => clearTimeout(timer)
      }
    }
    setPreviousPath(pathname)
  }, [pathname, previousPath, showLoading, loadingDelay])

  // Determine which transition variant to use
  const transitionType = variant || getTransitionType(pathname, previousPath)
  const variants = pageVariants[transitionType]

  // Use faster transition for quick navigation
  const transition = transitionType === 'fade' ? fastTransition : pageTransition

  return (
    <>
      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            variants={loadingVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={fastTransition}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <div className="relative">
              <div className="w-8 h-8 border-2 border-cyber-pink/30 border-t-cyber-pink rounded-full animate-spin" />
              <div className="absolute inset-0 w-8 h-8 border-2 border-transparent border-t-cyber-cyan rounded-full animate-spin animate-reverse"
                style={{ animationDelay: '0.1s' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page content with transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          className="relative"
        >
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {children}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

// Specialized transition components for specific use cases
export function DashboardTransition({ children }: { children: React.ReactNode }) {
  return (
    <PageTransitionLayout variant="scale">
      {children}
    </PageTransitionLayout>
  )
}

export function ModalTransition({ children }: { children: React.ReactNode }) {
  return (
    <PageTransitionLayout variant="fade">
      {children}
    </PageTransitionLayout>
  )
}

export function SlideTransition({
  children,
  direction = 'left'
}: {
  children: React.ReactNode
  direction?: 'left' | 'right'
}) {
  return (
    <PageTransitionLayout variant={direction === 'left' ? 'slideLeft' : 'slideRight'}>
      {children}
    </PageTransitionLayout>
  )
}

// Hook for programmatic page transitions
export function usePageTransition() {
  const pathname = usePathname()

  return {
    pathname,
    isTransitioning: false, // Could be enhanced with actual transition state
    transitionTo: (path: string) => {
      // Could add custom transition logic here
      window.location.href = path
    }
  }
} 