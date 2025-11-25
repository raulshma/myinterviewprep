import { Skeleton } from "@/components/ui/skeleton"

export default function InterviewLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Timeline Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div>
              <Skeleton className="h-6 w-48 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-2 w-32" />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border p-4">
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">
          {/* Opening Brief Card */}
          <div className="border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-20 mb-1" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          </div>

          {/* Revision Topics Card */}
          <div className="border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-36" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-border">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-40 mb-1" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          </div>

          {/* MCQs Card */}
          <div className="border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 border border-border">
                  <Skeleton className="h-4 w-full mb-3" />
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <Skeleton key={j} className="h-8 w-full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rapid Fire Card */}
          <div className="border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-44" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-3 border border-border">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
