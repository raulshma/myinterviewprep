import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border p-4">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <div className="mt-auto pt-6 border-t border-border">
          <Skeleton className="h-16 w-full" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-3xl">
          <Skeleton className="h-8 w-24 mb-1" />
          <Skeleton className="h-5 w-56 mb-8" />

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-28" />
            ))}
          </div>

          {/* Profile Section */}
          <div className="space-y-6">
            <div className="border border-border p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-40 mb-1" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>

            {/* Subscription Section */}
            <div className="border border-border p-6">
              <Skeleton className="h-6 w-28 mb-4" />
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-2 w-full mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
