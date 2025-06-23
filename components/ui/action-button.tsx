"use client"

import * as React from "react"
import { Button, ButtonProps } from "./button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"
import { cn } from "@/lib/utils"

// Color theme mappings for consistent tooltip colors
const colorThemes = {
    "cyber-cyan": {
        tooltipClass: "bg-cyber-cyan/90 text-white border-cyber-cyan/50",
    },
    "cyber-pink": {
        tooltipClass: "bg-cyber-pink/90 text-white border-cyber-pink/50",
    },
    "cyber-purple": {
        tooltipClass: "bg-purple-500/90 text-white border-purple-500/50",
    },
    "cyber-green": {
        tooltipClass: "bg-green-500/90 text-white border-green-500/50",
    },
    "cyber-orange": {
        tooltipClass: "bg-orange-500/90 text-white border-orange-500/50",
    },
    "cyber-red": {
        tooltipClass: "bg-red-500/90 text-white border-red-500/50",
    },
} as const

type ColorTheme = keyof typeof colorThemes

interface ActionButtonProps extends Omit<ButtonProps, 'variant'> {
    tooltip: string
    color: ColorTheme
    variant?: ButtonProps['variant'] // Allow override but default to color theme
    tooltipClassName?: string
    side?: "top" | "right" | "bottom" | "left"
}

export function ActionButton({
    tooltip,
    color,
    variant,
    tooltipClassName,
    side = "top",
    children,
    className,
    ...props
}: ActionButtonProps) {
    const theme = colorThemes[color]
    const buttonVariant = variant || color

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant={buttonVariant}
                    className={cn(
                        // Ensure icon buttons have consistent sizing
                        props.size === "icon" && "h-9 w-9",
                        className
                    )}
                    {...props}
                >
                    {children}
                </Button>
            </TooltipTrigger>
            <TooltipContent
                side={side}
                className={cn(theme.tooltipClass, tooltipClassName)}
            >
                {tooltip}
            </TooltipContent>
        </Tooltip>
    )
}

// Convenience wrapper that includes TooltipProvider
export function ActionButtonWithProvider(props: ActionButtonProps) {
    return (
        <TooltipProvider>
            <ActionButton {...props} />
        </TooltipProvider>
    )
}

// Pre-configured action buttons for common use cases
export function CopyButton(props: Omit<ActionButtonProps, 'color'>) {
    return <ActionButton color="cyber-cyan" {...props} />
}

export function ViewButton(props: Omit<ActionButtonProps, 'color'>) {
    return <ActionButton color="cyber-pink" {...props} />
}

export function QRButton(props: Omit<ActionButtonProps, 'color'>) {
    return <ActionButton color="cyber-purple" {...props} />
}

export function EditButton(props: Omit<ActionButtonProps, 'color'>) {
    return <ActionButton color="cyber-orange" {...props} />
}

export function DeleteButton(props: Omit<ActionButtonProps, 'color'>) {
    return <ActionButton color="cyber-red" {...props} />
}

export function SuccessButton(props: Omit<ActionButtonProps, 'color'>) {
    return <ActionButton color="cyber-green" {...props} />
} 