"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SidebarSkeletonProps {
  isCollapsed?: boolean;
}

/**
 * Skeleton loading state for the sidebar.
 * Matches the structure of SidebarUi for seamless transition.
 */
export function SidebarSkeleton({ isCollapsed = false }: SidebarSkeletonProps) {
  return (
    <aside
      className={cn(
        "bg-white dark:bg-black/20 border-r border-border dark:border-white/10 flex flex-col h-screen sticky top-0 z-50 transition-all duration-300",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Subtle tint overlay */}
      <div className="absolute inset-0 dark:bg-white/2 pointer-events-none" />

      {/* Logo Section */}
      <div
        className={cn(
          "relative p-8 pb-6",
          isCollapsed && "px-4 pb-6 flex justify-center"
        )}
      >
        {isCollapsed ? (
          <Skeleton className="w-8 h-8 rounded-lg" />
        ) : (
          <Skeleton className="h-8 w-40 rounded" />
        )}
      </div>

      {/* Navigation Skeleton */}
      <div className="relative flex-1 overflow-y-auto px-4">
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 rounded-xl p-3",
                isCollapsed && "justify-center"
              )}
            >
              <Skeleton className="w-5 h-5 rounded" />
              {!isCollapsed && <Skeleton className="h-4 flex-1 rounded" />}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className={cn("relative p-4 space-y-2", isCollapsed && "px-2")}>
        {/* Usage Stats Skeleton */}
        {!isCollapsed && (
          <div className="px-2 space-y-3">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        )}

        {/* Plan Badge Skeleton */}
        {!isCollapsed && (
          <div className="px-4 py-3 bg-muted dark:bg-white/5 rounded-2xl border border-border dark:border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-2 h-2 rounded-full" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            </div>
          </div>
        )}

        {/* Version Badge Skeleton */}
        {!isCollapsed && (
          <div className="px-2 flex items-center justify-center">
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        )}

        {/* User Section Skeleton */}
        <div
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl",
            isCollapsed && "justify-center"
          )}
        >
          <Skeleton className="w-10 h-10 rounded-full" />
          {!isCollapsed && (
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
