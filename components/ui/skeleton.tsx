'use client'

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

// Enhanced skeleton with shimmer effect
function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-lg bg-glass/50",
                "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite]",
                "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
                className
            )}
            {...props}
        />
    )
}

// Animated skeleton card with stagger effect
function SkeletonCard({
    className,
    delay = 0,
}: {
    className?: string
    delay?: number
}) {
    return (
        <motion.div
            className={cn("bg-glass/50 backdrop-blur-xl rounded-xl border border-white/5 p-6", className)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.4,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
        >
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
        </motion.div>
    )
}

// Enhanced stats skeleton with staggered animations
function SkeletonStats({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} delay={i * 0.1} />
            ))}
        </div>
    )
}

// Enhanced page skeleton with smooth entrance
function SkeletonPage() {
    return (
        <motion.div
            className="min-h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="container mx-auto px-4 py-8">
                <motion.div
                    className="mb-8 space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-5 w-96" />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <SkeletonStats count={8} />
                </motion.div>
            </div>
        </motion.div>
    )
}

// Enhanced form skeleton with better spacing
function SkeletonForm() {
    return (
        <motion.div
            className="bg-glass/50 backdrop-blur-xl rounded-xl border border-white/5 p-6"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
        >
            <div className="space-y-6">
                <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-10 w-full" />
                </motion.div>
                <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-24 w-full" />
                </motion.div>
                <motion.div
                    className="flex gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-20" />
                </motion.div>
            </div>
        </motion.div>
    )
}

// Enhanced list skeleton with staggered items
function SkeletonList({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    className="bg-glass/50 backdrop-blur-xl rounded-xl border border-white/5 p-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                        duration: 0.3,
                        delay: i * 0.05,
                        ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                >
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-8 w-8" />
                    </div>
                </motion.div>
            ))}
        </div>
    )
}

// New: Content area skeleton for dashboard sections
function SkeletonContent() {
    return (
        <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div
                className="bg-glass/50 backdrop-blur-xl rounded-xl border border-white/5 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                <div className="space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </div>
            </motion.div>
            <motion.div
                className="bg-glass/50 backdrop-blur-xl rounded-xl border border-white/5 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
            >
                <div className="space-y-4">
                    <Skeleton className="h-6 w-40" />
                    <SkeletonList count={3} />
                </div>
            </motion.div>
        </motion.div>
    )
}

export {
    Skeleton,
    SkeletonCard,
    SkeletonStats,
    SkeletonPage,
    SkeletonForm,
    SkeletonList,
    SkeletonContent
} 