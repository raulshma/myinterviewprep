import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function NewLearningPathLoading() {
  return (
    <div className="max-w-full px-4 md:px-0 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
        {/* Main form area skeleton */}
        <div className="lg:col-span-3 space-y-6">
          {/* Goal Input Card Skeleton */}
          <Card className="border-0 shadow-sm bg-card/50 rounded-3xl overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48 rounded-lg" />
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

          {/* Example Goals Skeleton */}
          <div className="bg-card/30 border border-border/50 p-6 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="h-5 w-32 rounded-lg" />
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-48 rounded-xl" />
              ))}
            </div>
          </div>
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
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                    <Skeleton className="h-4 w-3/4 rounded-lg" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
