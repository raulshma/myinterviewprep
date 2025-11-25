import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-40 mb-1" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      </header>

      <main className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border p-6">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-32" />
            ))}
          </div>
        </div>

        {/* AI Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border p-6">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>

        {/* Usage by Action */}
        <div className="bg-card border border-border p-6 mb-6">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-56 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-6 w-36" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2 w-32" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Skeleton className="h-6 w-36 mb-1" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
