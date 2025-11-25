import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <header className="border-b border-border px-6 h-16 flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </header>

      {/* Hero Skeleton */}
      <section className="py-16 px-6 border-b border-border">
        <div className="max-w-4xl mx-auto text-center">
          <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
          <Skeleton className="h-6 w-1/2 mx-auto mb-8" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-12 w-36" />
            <Skeleton className="h-12 w-36" />
          </div>
        </div>
      </section>

      {/* Features Grid Skeleton */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <Skeleton className="h-8 w-48 mx-auto mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-6 border border-border">
                <Skeleton className="h-10 w-10 mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
