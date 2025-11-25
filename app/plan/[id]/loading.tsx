import { Skeleton } from "@/components/ui/skeleton"

export default function PlanLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 h-16 flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 px-6 border-b border-border">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-10 w-3/4 mb-3" />
            <div className="flex items-center gap-2 mb-6">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-md">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-border p-3 text-center">
                  <Skeleton className="h-8 w-8 mx-auto mb-1" />
                  <Skeleton className="h-3 w-12 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Opening Brief */}
        <section className="py-8 px-6 border-b border-border">
          <div className="max-w-4xl mx-auto">
            <div className="border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
