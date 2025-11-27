import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function NewInterviewLoading() {
  return (
    <div className="max-w-full px-4 md:px-0 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
        {/* Main form area skeleton */}
        <div className="lg:col-span-3 space-y-6">
          {/* Quick Start Card Skeleton */}
          <Card className="border-0 shadow-sm bg-card/50 rounded-3xl overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32 rounded-lg" />
                  <Skeleton className="h-4 w-64 rounded-lg" />
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-[160px] w-full rounded-2xl" />
                <div className="flex justify-end">
                  <Skeleton className="h-11 w-32 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Divider Skeleton */}
          <div className="flex items-center gap-4 py-2 opacity-50">
            <div className="flex-1 h-px bg-border" />
            <Skeleton className="h-4 w-8 rounded" />
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Detailed Form Toggle Skeleton */}
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>

        {/* Side panel skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tips Skeleton */}
          <Card className="border-0 shadow-sm bg-card/50 rounded-3xl overflow-hidden">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="h-5 w-32 rounded-lg" />
              </div>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="w-5 h-5 rounded-full flex-shrink-0" />
                    <Skeleton className="h-4 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Benefits Skeleton */}
          <Card className="border-0 shadow-sm bg-card/50 rounded-3xl overflow-hidden">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="h-5 w-32 rounded-lg" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-1.5 h-1.5 rounded-full" />
                    <Skeleton className="h-4 w-3/4 rounded-lg" />
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-border/50 flex justify-between">
                <Skeleton className="h-3 w-20 rounded-lg" />
                <Skeleton className="h-3 w-3 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
