'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-500">Something went wrong!</h2>
        <p className="text-foreground/60">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
} 