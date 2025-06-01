'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface PageTransitionProps {
    children: ReactNode
    className?: string
}

// Page transition variants
export const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.98
    },
    enter: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
            staggerChildren: 0.1
        }
    },
    exit: {
        opacity: 0,
        y: -20,
        scale: 0.98,
        transition: {
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
}

// Stagger container for child animations
export const staggerContainer = {
    initial: {},
    enter: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
}

// Individual item animations
export const staggerItem = {
    initial: {
        opacity: 0,
        y: 20
    },
    enter: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
    const pathname = usePathname()

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                variants={pageVariants}
                initial="initial"
                animate="enter"
                exit="exit"
                className={className}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}

// Wrapper for staggered animations
export function StaggerContainer({ children, className = '' }: PageTransitionProps) {
    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="enter"
            className={className}
        >
            {children}
        </motion.div>
    )
}

// Individual stagger item
export function StaggerItem({ children, className = '', delay = 0 }: PageTransitionProps & { delay?: number }) {
    return (
        <motion.div
            variants={staggerItem}
            className={className}
            style={{ animationDelay: `${delay}s` }}
        >
            {children}
        </motion.div>
    )
} 