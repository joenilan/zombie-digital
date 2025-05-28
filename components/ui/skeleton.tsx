import { cn } from "@/lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-lg bg-glass/50", className)}
            {...props}
        />
    )
}

// Specific skeleton components for common patterns
function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("bg-glass/50 backdrop-blur-xl rounded-xl border border-white/5 p-6", className)} {...props}>
            <div className="animate-pulse space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
        </div>
    )
}

function SkeletonStats({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    )
}

function SkeletonPage() {
    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <SkeletonStats count={8} />
            </div>
        </div>
    )
}

function SkeletonForm() {
    return (
        <div className="bg-glass/50 backdrop-blur-xl rounded-xl border border-white/5 p-6">
            <div className="animate-pulse space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-20" />
                </div>
            </div>
        </div>
    )
}

function SkeletonList({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-glass/50 backdrop-blur-xl rounded-xl border border-white/5 p-4">
                    <div className="animate-pulse flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-8 w-8" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export {
    Skeleton,
    SkeletonCard,
    SkeletonStats,
    SkeletonPage,
    SkeletonForm,
    SkeletonList
} 