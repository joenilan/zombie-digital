'use client'

import { motion } from 'framer-motion'
import { ReactNode, MouseEvent } from 'react'
import { buttonAnimations, cyberGlow } from '@/lib/animations'

interface AnimatedButtonProps {
    children: ReactNode
    className?: string
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'cyber'
    size?: 'sm' | 'md' | 'lg'
    enableGlow?: boolean
    icon?: ReactNode
    loading?: boolean
    disabled?: boolean
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void
    type?: 'button' | 'submit' | 'reset'
}

export function AnimatedButton({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    enableGlow = false,
    icon,
    loading = false,
    disabled = false,
    onClick,
    type = 'button'
}: AnimatedButtonProps) {
    const baseClasses = "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background"

    const variantClasses = {
        primary: "bg-gradient-to-r from-cyber-pink to-purple-600 text-white hover:from-cyber-pink/90 hover:to-purple-600/90 focus:ring-cyber-pink/50",
        secondary: "bg-gradient-to-r from-cyber-cyan to-blue-600 text-white hover:from-cyber-cyan/90 hover:to-blue-600/90 focus:ring-cyber-cyan/50",
        outline: "border-2 border-white/20 text-foreground hover:border-cyber-pink/50 hover:bg-cyber-pink/10 focus:ring-cyber-pink/50",
        ghost: "text-foreground hover:bg-white/10 focus:ring-white/20",
        cyber: "bg-gradient-to-r from-glass/30 to-glass/10 backdrop-blur-xl border border-cyber-pink/20 text-foreground hover:border-cyber-pink/40 hover:bg-glass/50 focus:ring-cyber-pink/50"
    }

    const sizeClasses = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg"
    }

    const isDisabled = disabled || loading

    return (
        <motion.button
            variants={buttonAnimations}
            initial="initial"
            whileHover={!isDisabled ? "hover" : undefined}
            whileTap={!isDisabled ? "tap" : undefined}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isDisabled}
            onClick={onClick}
            type={type}
        >
            {enableGlow && (
                <motion.div
                    variants={cyberGlow}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyber-pink/20 to-cyber-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
            )}

            <div className="relative z-10 flex items-center gap-2">
                {loading ? (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                    />
                ) : icon ? (
                    <span className="flex-shrink-0">{icon}</span>
                ) : null}

                <span>{children}</span>
            </div>
        </motion.button>
    )
}

// Specialized button variants
export function CyberButton({ children, className = '', ...props }: Omit<AnimatedButtonProps, 'variant'>) {
    return (
        <AnimatedButton
            variant="cyber"
            enableGlow
            className={`group ${className}`}
            {...props}
        >
            {children}
        </AnimatedButton>
    )
}

export function PrimaryButton({ children, className = '', ...props }: Omit<AnimatedButtonProps, 'variant'>) {
    return (
        <AnimatedButton
            variant="primary"
            className={`shadow-lg hover:shadow-cyber ${className}`}
            {...props}
        >
            {children}
        </AnimatedButton>
    )
}

export function SecondaryButton({ children, className = '', ...props }: Omit<AnimatedButtonProps, 'variant'>) {
    return (
        <AnimatedButton
            variant="secondary"
            className={`shadow-lg hover:shadow-cyber ${className}`}
            {...props}
        >
            {children}
        </AnimatedButton>
    )
} 