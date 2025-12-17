"use client";

import { SidebarSkeleton } from "./sidebar-skeleton";
import { SidebarProvider } from "./sidebar-context";
import { cn } from "@/lib/utils";

/**
 * Skeleton version of the sidebar layout.
 * Shows immediately while the real sidebar data is loading.
 */
export function SidebarLayoutSkeleton({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div
        className="flex min-h-screen bg-background relative"
        data-pet-surface="app-shell"
        data-pet-edge-container
        data-pet-edge-id="app-shell"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-secondary/5" />
        </div>

        {/* Desktop sidebar skeleton */}
        <div
          data-desktop-sidebar
          className={cn(
            "hidden md:block shrink-0 relative z-20 transition-all duration-300 w-72"
          )}
        >
          <SidebarSkeleton />
        </div>

        {/* Mobile header skeleton */}
        <div className="flex-1 flex flex-col min-w-0 w-full max-w-full relative z-10">
          {/* Mobile header placeholder */}
          <div className="md:hidden h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm" />

          {/* Main content - render children immediately */}
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
