export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-32 bg-foreground/10 rounded" />
        <div className="h-4 w-48 bg-foreground/10 rounded" />
      </div>
    </div>
  );
} 