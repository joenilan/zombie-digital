'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { pageAnimations, staggerContainer } from '@/lib/animations'

interface AnimatedLayoutProps {
    children: ReactNode
    className?: string
    enableStagger?: boolean
}

export function AnimatedLayout({
    children,
    className = '',
    enableStagger = false
}: AnimatedLayoutProps) {
    const variants = enableStagger ? staggerContainer : pageAnimations

    return (
        <motion.div
            variants={variants}
            initial="initial"
            animate="enter"
            exit="exit"
            className={`relative z-10 ${className}`}
        >
            {children}
        </motion.div>
    )
}

// Specialized layouts for different page types
export function DashboardLayout({ children, className = '' }: AnimatedLayoutProps) {
    return (
        <AnimatedLayout
            className={`relative z-10 ${className}`}
            enableStagger
        >
            {children}
        </AnimatedLayout>
    )
}

export function AuthLayout({ children, className = '' }: AnimatedLayoutProps) {
    return (
        <AnimatedLayout
            className={`relative z-10 ${className}`}
        >
            {children}
        </AnimatedLayout>
    )
}

export function ProfileLayout({ children, className = '' }: AnimatedLayoutProps) {
    return (
        <AnimatedLayout
            className={`relative z-10 ${className}`}
            enableStagger
        >
            {children}
        </AnimatedLayout>
    )
} 