import { Skeleton } from "@/components/ui/skeleton"

export default function PricingLoading() {
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
        {/* Hero */}
        <section className="py-16 px-6 border-b border-border">
          <div className="max-w-4xl mx-auto text-center">
            <Skeleton className="h-10 w-96 mx-auto mb-4" />
            <Skeleton className="h-5 w-80 mx-auto" />
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-px bg-border">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-background p-8">
                  <Skeleton className="h-6 w-20 mb-1" />
                  <Skeleton className="h-4 w-40 mb-4" />
                  <div className="flex items-baseline gap-1 mb-6">
                    <Skeleton className="h-10 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="space-y-3 mb-8">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))}
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Plan Comparison */}
        <section className="py-16 px-6 border-y border-border bg-card">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-48 mx-auto mb-8" />
            <div className="space-y-4">
              <div className="flex border-b border-border pb-4">
                <Skeleton className="h-5 w-24 flex-1" />
                <Skeleton className="h-5 w-16 text-center" />
                <Skeleton className="h-5 w-16 text-center ml-8" />
                <Skeleton className="h-5 w-16 text-center ml-8" />
              </div>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex items-center border-b border-border pb-4">
                  <Skeleton className="h-4 w-32 flex-1" />
                  <Skeleton className="h-4 w-12 text-center" />
                  <Skeleton className="h-4 w-12 text-center ml-8" />
                  <Skeleton className="h-4 w-12 text-center ml-8" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 px-6 border-t border-border">
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-8 w-64 mx-auto mb-8" />
            <div className="divide-y divide-border border-y border-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="py-6">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3 mt-1" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
