import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="w-full space-y-8 pb-20 animate-pulse">
      {/* Header Skeleton is handled by global skeleton usually, but we keep a spacer just in case or remove if handled */}
      
      {/* Stats Grid Skeleton (Overview Mosaic) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Skeleton className="h-[240px] rounded-3xl" />
        <Skeleton className="h-[240px] rounded-3xl" />
        <Skeleton className="h-[240px] rounded-3xl" />
      </div>

      {/* Interviews Grid Skeleton (Mosaic Column) */}
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          <Skeleton className="h-[300px] w-full rounded-3xl break-inside-avoid mb-6" />
          <Skeleton className="h-[250px] w-full rounded-3xl break-inside-avoid mb-6" />
          <Skeleton className="h-[350px] w-full rounded-3xl break-inside-avoid mb-6" />
          <Skeleton className="h-[280px] w-full rounded-3xl break-inside-avoid mb-6" />
          <Skeleton className="h-[320px] w-full rounded-3xl break-inside-avoid mb-6" />
        </div>
      </div>
    </div>
  );
}
