'use client'

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Enhanced card variants with glass morphism and cyber theme
const cardVariants = cva(
  "rounded-xl border text-card-foreground transition-all duration-300 relative overflow-hidden",
  {
    variants: {
      variant: {
        // Standard card - basic styling
        default: "bg-card shadow-sm border-border",

        // Glass morphism variants
        glass: "bg-glass backdrop-blur-xl border-white/5 shadow-glass",
        "glass-subtle": "bg-glass-subtle backdrop-blur-xl border-white/10 shadow-glass",
        "glass-strong": "bg-glass-strong backdrop-blur-xl border-white/20 shadow-glass",

        // Interactive glass variants
        "glass-interactive": "bg-glass backdrop-blur-xl border-white/5 shadow-glass hover:bg-glass-hover hover:border-white/20 hover:shadow-cyber-hover cursor-pointer",
        "glass-subtle-interactive": "bg-glass-subtle backdrop-blur-xl border-white/10 shadow-glass hover:bg-glass-medium hover:border-white/20 hover:shadow-cyber-hover cursor-pointer",

        // Ethereal variant (existing pattern)
        ethereal: "bg-glass backdrop-blur-xl border border-white/5 shadow-cyber hover:shadow-cyber-hover",
        "ethereal-interactive": "bg-glass backdrop-blur-xl border border-white/5 shadow-cyber hover:shadow-cyber-hover cursor-pointer focus-ring",

        // Status variants
        success: "bg-green-500/10 border-green-500/20 backdrop-blur-xl",
        warning: "bg-yellow-500/10 border-yellow-500/20 backdrop-blur-xl",
        error: "bg-red-500/10 border-red-500/20 backdrop-blur-xl",
        info: "bg-blue-500/10 border-blue-500/20 backdrop-blur-xl",

        // Special variants
        highlight: "bg-cyber-gradient/10 border-cyber-pink/20 backdrop-blur-xl",
        feature: "bg-glass-subtle backdrop-blur-xl border-white/10 hover:bg-glass-medium hover:border-white/20 hover:shadow-[0_8px_32px_rgba(145,70,255,0.15)]",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
      spacing: {
        tight: "space-y-2",
        default: "space-y-4",
        loose: "space-y-6",
      }
    },
    defaultVariants: {
      variant: "glass",
      size: "default",
      spacing: "default",
    },
  }
)

// Motion card wrapper for animations
const MotionCard = motion.div

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardVariants> {
  asChild?: boolean
  animated?: boolean
  animationDelay?: number
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, spacing, animated = false, animationDelay = 0, asChild = false, children, ...props }, ref) => {
    const cardClasses = cn(cardVariants({ variant, size, spacing, className }))

    if (animated) {
      return (
        <MotionCard
          ref={ref}
          className={cardClasses}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: animationDelay,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          style={props.style}
          id={props.id}
          role={props.role}
          onClick={props.onClick}
          onMouseEnter={props.onMouseEnter}
          onMouseLeave={props.onMouseLeave}
        >
          {children}
        </MotionCard>
      )
    }

    return (
      <div
        ref={ref}
        className={cardClasses}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    spacing?: "tight" | "default" | "loose"
  }
>(({ className, spacing = "default", ...props }, ref) => {
  const spacingClasses = {
    tight: "space-y-1",
    default: "space-y-1.5",
    loose: "space-y-2"
  }

  return (
    <div
      ref={ref}
      className={cn("flex flex-col", spacingClasses[spacing], className)}
      {...props}
    />
  )
})
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    size?: "sm" | "default" | "lg" | "xl"
  }
>(({ className, size = "default", ...props }, ref) => {
  const sizeClasses = {
    sm: "text-lg",
    default: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl"
  }

  return (
    <h3
      ref={ref}
      className={cn(
        "font-heading font-semibold leading-none tracking-tight",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    size?: "sm" | "default" | "lg"
  }
>(({ className, size = "default", ...props }, ref) => {
  const sizeClasses = {
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base"
  }

  return (
    <p
      ref={ref}
      className={cn(
        "text-muted-foreground font-body leading-relaxed",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
})
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    spacing?: "tight" | "default" | "loose"
  }
>(({ className, spacing = "default", ...props }, ref) => {
  const spacingClasses = {
    tight: "space-y-2",
    default: "space-y-4",
    loose: "space-y-6"
  }

  return (
    <div
      ref={ref}
      className={cn("font-body", spacingClasses[spacing], className)}
      {...props}
    />
  )
})
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    justify?: "start" | "center" | "end" | "between"
  }
>(({ className, justify = "start", ...props }, ref) => {
  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between"
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center font-body",
        justifyClasses[justify],
        className
      )}
      {...props}
    />
  )
})
CardFooter.displayName = "CardFooter"

// Specialized card components for common patterns
const FeatureCard = React.forwardRef<
  HTMLDivElement,
  CardProps & {
    icon?: React.ReactNode
    title: string
    description: string
    delay?: number
  }
>(({ icon, title, description, delay = 0, className, ...props }, ref) => {
  return (
    <Card
      ref={ref}
      variant="feature"
      animated
      animationDelay={delay}
      className={cn("group", className)}
      {...props}
    >
      <CardContent spacing="tight">
        <div className="flex items-center gap-3 mb-2">
          {icon && (
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyber-pink/20 to-purple-500/20 
                            group-hover:from-cyber-pink/30 group-hover:to-purple-500/30 transition-all duration-300">
              {icon}
            </div>
          )}
          <CardTitle className="group-hover:text-white transition-colors duration-300">
            {title}
          </CardTitle>
        </div>
        <CardDescription className="group-hover:text-foreground/90 transition-colors duration-300 leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  )
})
FeatureCard.displayName = "FeatureCard"

const StatCard = React.forwardRef<
  HTMLDivElement,
  CardProps & {
    icon?: React.ReactNode
    title: string
    value: string | number
    change?: string
    trend?: "up" | "down" | "neutral"
  }
>(({ icon, title, value, change, trend, className, ...props }, ref) => {
  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    neutral: "text-muted-foreground"
  }

  return (
    <Card
      ref={ref}
      variant="glass-interactive"
      className={className}
      {...props}
    >
      <CardContent spacing="tight">
        <div className="flex items-center justify-between">
          {icon && (
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          {change && (
            <span className={cn("text-sm font-medium", trendColors[trend || "neutral"])}>
              {change}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-ui">{title}</p>
          <p className="text-2xl font-bold font-heading">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
})
StatCard.displayName = "StatCard"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  FeatureCard,
  StatCard,
  cardVariants
} 