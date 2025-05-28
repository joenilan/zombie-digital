import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "minimal";
  className?: string;
}

export function LoadingSpinner({
  text = "Loading...",
  size = "md",
  variant = "default",
  className
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24"
  }

  const containerClasses = {
    default: "flex flex-col items-center justify-center min-h-[400px] gap-4",
    minimal: "flex items-center justify-center p-4"
  }

  if (variant === "minimal") {
    return (
      <div className={cn(containerClasses.minimal, className)}>
        <div className={cn("relative", sizeClasses[size])}>
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-background/20" />
          {/* Spinning gradient ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyber-pink border-r-cyber-cyan animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn(containerClasses.default, className)}>
      <div className={cn("relative", sizeClasses[size])}>
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-background/20" />
        {/* Spinning gradient ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyber-pink border-r-cyber-cyan animate-spin" />
      </div>
      {text && (
        <div className="text-lg text-muted-foreground animate-pulse">
          {text}
        </div>
      )}
    </div>
  )
} 