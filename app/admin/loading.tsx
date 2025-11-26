import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLoading() {
  return (
    <main className="flex-1 overflow-auto">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-7 w-40 mb-1" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </header>

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-6">
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
          <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-32 rounded-sm" />
            ))}
          </div>
        </div>

        {/* AI Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>

        {/* Usage by Action */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-56 mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-36 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2 w-32 rounded" />
                  <Skeleton className="h-3 w-8" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Skeleton className="h-6 w-36 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-40 rounded-md" />
          </div>
          {/* Table header */}
          <div className="border-b border-border pb-3 mb-2">
            <div className="grid grid-cols-8 gap-4">
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
          {/* Table rows */}
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-8 gap-4 items-center py-2">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-5 w-10 rounded-full" />
                <Skeleton className="h-6 w-6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
