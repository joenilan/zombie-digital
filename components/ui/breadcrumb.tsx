'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronRight, Home } from '@/lib/icons'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
    label: string
    href?: string
    icon?: React.ReactNode
    isCurrentPage?: boolean
}

interface BreadcrumbProps {
    items?: BreadcrumbItem[]
    variant?: 'default' | 'minimal' | 'glass' | 'cyber'
    showHome?: boolean
    className?: string
    separator?: React.ReactNode
    maxItems?: number
}

// Auto-generate breadcrumbs from pathname
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    // Add home
    breadcrumbs.push({
        label: 'Home',
        href: '/',
        icon: <Home className="w-4 h-4" />
    })

    // Build breadcrumbs from segments
    let currentPath = ''
    segments.forEach((segment, index) => {
        currentPath += `/${segment}`
        const isLast = index === segments.length - 1

        // Format segment label
        let label = segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')

        // Special cases for known routes
        if (segment === 'dashboard') label = 'Dashboard'
        if (segment === 'social-links') label = 'Social Links'
        if (segment === 'canvas') label = 'Canvas'
        if (segment === 'settings') label = 'Settings'
        if (segment === 'admin') label = 'Admin'

        breadcrumbs.push({
            label,
            href: isLast ? undefined : currentPath,
            isCurrentPage: isLast
        })
    })

    return breadcrumbs
}

const breadcrumbVariants = {
    default: {
        container: "flex items-center space-x-1 text-sm",
        item: "text-muted-foreground hover:text-foreground transition-colors",
        current: "text-foreground font-medium",
        separator: "text-muted-foreground/50"
    },
    minimal: {
        container: "flex items-center space-x-2 text-sm",
        item: "text-muted-foreground hover:text-foreground transition-colors",
        current: "text-foreground",
        separator: "text-muted-foreground/30"
    },
    glass: {
        container: "flex items-center space-x-2 px-4 py-2 bg-glass-subtle backdrop-blur-xl rounded-lg border border-white/5",
        item: "text-muted-foreground hover:text-foreground transition-colors",
        current: "text-foreground font-medium",
        separator: "text-muted-foreground/50"
    },
    cyber: {
        container: "flex items-center space-x-2 px-4 py-2 bg-cyber-gradient/10 backdrop-blur-xl rounded-lg border border-cyber-pink/20",
        item: "text-muted-foreground hover:text-cyber-cyan transition-colors",
        current: "text-cyber-pink font-medium",
        separator: "text-cyber-cyan/50"
    }
}

export function Breadcrumb({
    items,
    variant = 'default',
    showHome = true,
    className,
    separator,
    maxItems = 5
}: BreadcrumbProps) {
    const pathname = usePathname()

    // Use provided items or auto-generate from pathname
    const breadcrumbItems = items || generateBreadcrumbs(pathname)

    // Filter out home if showHome is false
    const filteredItems = showHome ? breadcrumbItems : breadcrumbItems.slice(1)

    // Truncate if too many items
    const displayItems = filteredItems.length > maxItems
        ? [
            ...filteredItems.slice(0, 1),
            { label: '...', href: undefined },
            ...filteredItems.slice(-maxItems + 2)
        ]
        : filteredItems

    const styles = breadcrumbVariants[variant]
    const defaultSeparator = separator || <ChevronRight className="w-4 h-4" />

    return (
        <nav
            aria-label="Breadcrumb"
            className={cn(styles.container, className)}
        >
            <ol className="flex items-center space-x-1">
                {displayItems.map((item, index) => {
                    const isLast = index === displayItems.length - 1
                    const isEllipsis = item.label === '...'

                    return (
                        <li key={`${item.href}-${index}`} className="flex items-center space-x-1">
                            {isEllipsis ? (
                                <span className={styles.separator}>...</span>
                            ) : (
                                <>
                                    {item.href && !item.isCurrentPage ? (
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                styles.item,
                                                "flex items-center space-x-1 hover:underline focus-ring rounded-sm px-1 py-0.5"
                                            )}
                                        >
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </Link>
                                    ) : (
                                        <span
                                            className={cn(
                                                item.isCurrentPage ? styles.current : styles.item,
                                                "flex items-center space-x-1 px-1 py-0.5"
                                            )}
                                            aria-current={item.isCurrentPage ? "page" : undefined}
                                        >
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </span>
                                    )}
                                </>
                            )}

                            {!isLast && (
                                <span className={cn(styles.separator, "mx-1")}>
                                    {defaultSeparator}
                                </span>
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}

// Animated breadcrumb with entrance animation
export function AnimatedBreadcrumb(props: BreadcrumbProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            <Breadcrumb {...props} />
        </motion.div>
    )
}

// Compact breadcrumb for mobile
export function CompactBreadcrumb({
    className,
    ...props
}: Omit<BreadcrumbProps, 'variant' | 'maxItems'>) {
    return (
        <Breadcrumb
            {...props}
            variant="minimal"
            maxItems={3}
            showHome={false}
            className={cn("sm:hidden", className)}
        />
    )
}

// Full breadcrumb for desktop
export function DesktopBreadcrumb({
    className,
    ...props
}: BreadcrumbProps) {
    return (
        <Breadcrumb
            {...props}
            className={cn("hidden sm:flex", className)}
        />
    )
} 