'use client'

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-ui font-medium transition-smooth focus-ring disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90 interactive-scale",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 interactive-scale",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground interactive-lift",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 interactive-scale",
        ghost: "hover:bg-accent hover:text-accent-foreground interactive-scale",
        link: "text-primary underline-offset-4 hover:underline transition-smooth",
        ethereal: "bg-cyber-gradient text-white shadow-cyber hover:shadow-cyber-hover interactive-scale",
        glass: "bg-glass/20 backdrop-blur-sm border border-white/5 hover:bg-glass/30 hover:border-white/10 interactive-lift",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Enhanced button with micro-interactions
const MotionButton = motion.button

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, icon, children, disabled, ...props }, ref) => {
    const buttonContent = (
      <>
        {/* Shimmer effect for ethereal variant */}
        {variant === 'ethereal' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        )}

        {/* Loading spinner */}
        {loading && (
          <motion.div
            className="mr-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </motion.div>
        )}

        {/* Icon */}
        {icon && !loading && (
          <span className="mr-2">{icon}</span>
        )}

        {/* Button text */}
        <span className="relative z-10">{children}</span>
      </>
    )

    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <MotionButton
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: variant === 'link' ? 1 : 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...(props as any)}
      >
        {buttonContent}
      </MotionButton>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants } 