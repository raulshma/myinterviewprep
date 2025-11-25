import { Skeleton } from "@/components/ui/skeleton"

export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 h-16 flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-24" />
      </header>

      {/* Progress */}
      <div className="border-b border-border">
        <div className="max-w-xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-1 flex-1" />
            <Skeleton className="h-1 flex-1" />
            <Skeleton className="h-1 flex-1" />
          </div>
          <Skeleton className="h-3 w-20 mt-2" />
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl">
          <Skeleton className="h-8 w-80 mb-2" />
          <Skeleton className="h-5 w-96 mb-8" />
          
          {/* Role Selection Grid */}
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 border border-border">
                <Skeleton className="h-8 w-8 mb-3" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="border-t border-border px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      </footer>
    </div>
  )
}
