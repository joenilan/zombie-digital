export default function DashboardLoading() {
  return (
    <div className="bg-glass rounded-xl shadow-glass p-6 transition-all duration-300 hover:shadow-cyber">
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-64 bg-background/20 rounded-lg" />
        <div className="h-4 w-96 bg-background/20 rounded-lg" />
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="h-32 bg-background/20 rounded-lg" />
          <div className="h-32 bg-background/20 rounded-lg" />
          <div className="h-32 bg-background/20 rounded-lg" />
        </div>
      </div>
    </div>
  )
} 