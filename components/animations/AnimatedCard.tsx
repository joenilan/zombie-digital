'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cardAnimations, staggerItem, cyberGlow } from '@/lib/animations'

interface AnimatedCardProps {
    children: ReactNode
    className?: string
    enableHover?: boolean
    enableGlow?: boolean
    delay?: number
    onClick?: () => void
}

export function AnimatedCard({
    children,
    className = '',
    enableHover = true,
    enableGlow = false,
    delay = 0,
    onClick
}: AnimatedCardProps) {
    const baseClasses = "bg-glass/50 backdrop-blur-xl rounded-xl border border-white/5"

    return (
        <motion.div
            variants={cardAnimations}
            initial="initial"
            animate="enter"
            whileHover={enableHover ? "hover" : undefined}
            whileTap={onClick ? "tap" : undefined}
            className={`${baseClasses} ${className} ${onClick ? 'cursor-pointer' : ''}`}
            style={{ animationDelay: `${delay}s` }}
            onClick={onClick}
        >
            {enableGlow && (
                <motion.div
                    variants={cyberGlow}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyber-pink/10 to-cyber-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
            )}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    )
}

// Specialized card variants
export function StatsCard({ children, className = '', delay = 0 }: AnimatedCardProps) {
    return (
        <motion.div
            variants={staggerItem}
            className={`bg-glass/30 backdrop-blur-xl rounded-xl border border-white/10 p-6 
                  hover:bg-glass/50 hover:border-white/20 transition-all duration-300 
                  hover:shadow-glass group ${className}`}
            style={{ animationDelay: `${delay}s` }}
        >
            {children}
        </motion.div>
    )
}

export function GlassCard({ children, className = '', enableHover = true }: AnimatedCardProps) {
    return (
        <motion.div
            variants={cardAnimations}
            initial="initial"
            animate="enter"
            whileHover={enableHover ? "hover" : undefined}
            className={`bg-glass/40 backdrop-blur-xl rounded-2xl border border-white/10 
                  shadow-glass hover:shadow-cyber transition-all duration-300 ${className}`}
        >
            {children}
        </motion.div>
    )
}

export function CyberCard({ children, className = '', onClick }: AnimatedCardProps) {
    return (
        <motion.div
            variants={cardAnimations}
            initial="initial"
            animate="enter"
            whileHover="hover"
            whileTap={onClick ? "tap" : undefined}
            className={`bg-gradient-to-br from-glass/30 to-glass/10 backdrop-blur-xl 
                  rounded-xl border border-cyber-pink/20 shadow-cyber
                  hover:border-cyber-pink/40 hover:shadow-cyber-hover
                  transition-all duration-300 group ${className} ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyber-pink/5 to-cyber-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    )
} 