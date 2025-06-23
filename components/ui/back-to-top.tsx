'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from '@/lib/icons'
import { cn } from '@/lib/utils'

interface BackToTopProps {
    threshold?: number
    className?: string
    variant?: 'default' | 'cyber' | 'minimal'
}

const variants = {
    default: {
        button: "fixed bottom-6 right-6 z-50 p-3 rounded-full bg-glass/80 backdrop-blur-xl border border-white/10 text-foreground hover:bg-glass hover:border-white/20 transition-all duration-300 shadow-glass",
        icon: "w-5 h-5"
    },
    cyber: {
        button: "fixed bottom-6 right-6 z-50 p-3 rounded-full bg-cyber-gradient/20 backdrop-blur-xl border border-cyber-pink/30 text-cyber-pink hover:bg-cyber-gradient/30 hover:border-cyber-pink/50 transition-all duration-300 shadow-cyber",
        icon: "w-5 h-5"
    },
    minimal: {
        button: "fixed bottom-6 right-6 z-50 p-2 rounded-lg bg-background/80 backdrop-blur-xl border border-border text-muted-foreground hover:text-foreground hover:bg-background transition-all duration-300",
        icon: "w-4 h-4"
    }
}

export function BackToTop({
    threshold = 300,
    className,
    variant = 'default'
}: BackToTopProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > threshold) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener('scroll', toggleVisibility)
        return () => window.removeEventListener('scroll', toggleVisibility)
    }, [threshold])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    const variantStyles = variants[variant]

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25
                    }}
                    onClick={scrollToTop}
                    className={cn(variantStyles.button, className)}
                    aria-label="Back to top"
                >
                    <ArrowUp className={variantStyles.icon} />
                </motion.button>
            )}
        </AnimatePresence>
    )
}

// Progress indicator variant that shows scroll progress
export function ScrollProgress({ className }: { className?: string }) {
    const [scrollProgress, setScrollProgress] = useState(0)

    useEffect(() => {
        const updateScrollProgress = () => {
            const scrollPx = document.documentElement.scrollTop
            const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight
            const scrolled = scrollPx / winHeightPx
            setScrollProgress(scrolled)
        }

        window.addEventListener('scroll', updateScrollProgress)
        return () => window.removeEventListener('scroll', updateScrollProgress)
    }, [])

    return (
        <motion.div
            className={cn(
                "fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyber-pink to-cyber-cyan z-50 origin-left",
                className
            )}
            style={{ scaleX: scrollProgress }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: scrollProgress }}
            transition={{ duration: 0.1 }}
        />
    )
}

// Combined component with both back to top and progress
export function ScrollIndicator({
    threshold = 300,
    showProgress = true,
    variant = 'cyber'
}: {
    threshold?: number
    showProgress?: boolean
    variant?: 'default' | 'cyber' | 'minimal'
}) {
    return (
        <>
            {showProgress && <ScrollProgress />}
            <BackToTop threshold={threshold} variant={variant} />
        </>
    )
} 