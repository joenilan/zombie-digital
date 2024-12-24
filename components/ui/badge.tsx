import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-yellow-500 to-orange-500 text-white",
        destructive:
          "bg-gradient-to-r from-red-500 to-pink-500 text-white",
        warning:
          "bg-gradient-to-r from-orange-500 to-amber-500 text-white",
        success:
          "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
        secondary:
          "bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants } 