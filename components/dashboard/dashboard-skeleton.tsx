"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function DashboardSkeleton() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Skeleton className="h-6 w-24 mb-3" />
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-7 w-12" />
                </div>
                <Skeleton className="w-10 h-10" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filters skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <Skeleton className="h-10 w-full sm:max-w-sm" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>

      {/* Cards grid skeleton */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div
            key={i}
            className="bg-card border border-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            {/* Header */}
            <div className="p-5 pb-4 border-b border-border">
              <div className="flex items-start justify-between mb-3">
                <Skeleton className="w-10 h-10" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            {/* Content */}
            <div className="p-5 pt-4">
              <div className="flex flex-wrap gap-1.5 mb-4">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-14" />
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-1.5 w-full" />
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
