import { Skeleton } from "@/components/ui/skeleton"

export default function NewInterviewLoading() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-8 max-w-2xl">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-7 w-56 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>

          <div className="space-y-4">
            {/* Job Title */}
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Company */}
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Resume Upload */}
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-32 w-full" />
            </div>

            {/* Job Description */}
            <div>
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-44" />
        </div>
      </div>
    </main>
  )
}
