interface LoadingSpinnerProps {
  text?: string;
}

export function LoadingSpinner({ text = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="relative w-16 h-16">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-background/20" />
        {/* Spinning gradient ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyber-pink border-r-cyber-cyan animate-spin" />
      </div>
      <div className="text-lg text-muted-foreground animate-pulse">
        {text}
      </div>
    </div>
  )
} 