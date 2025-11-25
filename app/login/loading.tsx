import { Skeleton } from "@/components/ui/skeleton"

export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 h-16 flex items-center">
        <Skeleton className="h-8 w-32" />
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-5 w-72 mx-auto" />
          </div>

          <div className="space-y-3">
            {/* OAuth Buttons */}
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center">
                <Skeleton className="h-4 w-8 bg-background" />
              </div>
            </div>

            <Skeleton className="h-12 w-full" />
          </div>

          <div className="mt-6 text-center">
            <Skeleton className="h-4 w-56 mx-auto" />
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <Skeleton className="h-3 w-64 mx-auto" />
          </div>
        </div>
      </main>
    </div>
  )
}
