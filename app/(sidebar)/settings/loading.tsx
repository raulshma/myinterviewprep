import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="grid gap-6 lg:grid-cols-2 w-full max-w-full">
        {/* Left column */}
        <div className="space-y-6 min-w-0">
          {/* Profile Section Skeleton */}
          <Card className="border-0 shadow-sm bg-card/50 rounded-3xl overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="w-20 h-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32 rounded-lg" />
                  <Skeleton className="h-4 w-48 rounded-lg" />
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </CardContent>
          </Card>

          {/* API Keys Section Skeleton */}
          <Card className="border-0 shadow-sm bg-card/50 rounded-3xl overflow-hidden">
            <CardContent className="p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="h-5 w-32 rounded-lg" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6 min-w-0">
          {/* Subscription Section Skeleton */}
          <Card className="border-0 shadow-sm bg-card/50 rounded-3xl overflow-hidden">
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="h-5 w-32 rounded-lg" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-2/3 rounded-lg" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
            </CardContent>
          </Card>

          {/* Usage Stats Skeleton */}
          <Card className="border-0 shadow-sm bg-card/50 rounded-3xl overflow-hidden">
            <CardContent className="p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="h-5 w-32 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
