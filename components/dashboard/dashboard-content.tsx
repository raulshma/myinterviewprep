"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InterviewCardNew } from "./interview-card";
import { deleteInterview } from "@/lib/actions/interview";
import type { DashboardInterviewData } from "@/lib/actions/dashboard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DashboardContentProps {
  interviews: DashboardInterviewData[];
  total: number;
  currentPage: number;
}

const ITEMS_PER_PAGE = 9;

export function DashboardContent({
  interviews: initialInterviews,
  total,
  currentPage,
}: DashboardContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [interviews, setInterviews] = useState(initialInterviews);
  const [isPending, startTransition] = useTransition();

  // Sync interviews when props change (e.g. after pagination/search)
  useEffect(() => {
    setInterviews(initialInterviews);
  }, [initialInterviews]);

  // URL State
  const currentSearch = searchParams.get("search")?.toString() || "";
  const currentStatus = searchParams.get("status")?.toString() || "all";

  // Debounced Search Handler
  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // Reset to page 1
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Filter Handler
  const handleFilter = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status && status !== "all") {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    params.set("page", "1"); // Reset to page 1
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Pagination Handler
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    // Scroll to top of list
    const listElement = document.getElementById("interview-list");
    if (listElement) {
       listElement.scrollIntoView({ behavior: 'smooth' });
    }
    router.push(`${pathname}?${params.toString()}`);
  };
  
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleDelete = async (interviewId: string) => {
    startTransition(async () => {
      const result = await deleteInterview(interviewId);
      if (result.success) {
        setInterviews((prev) => prev.filter((i) => i._id !== interviewId));
        router.refresh(); 
      }
    });
  };

  return (
    <div className="overflow-hidden space-y-8" id="interview-list">
      {/* Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-4 z-10 bg-background/80 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-sm transition-all duration-300">
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
          <Input
            placeholder="Search interviews..."
            className="pl-10 h-11 rounded-xl bg-secondary/50 border-transparent focus:bg-background focus:border-primary/20 transition-all duration-300"
            defaultValue={currentSearch}
            onChange={(e) => {
              const val = e.target.value;
              setTimeout(() => handleSearch(val), 300); 
            }}
          />
        </div>

        <div className="flex items-center gap-1 bg-secondary/30 p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
            {(["all", "active", "completed"] as const).map((status) => (
            <Button
                key={status}
                variant={currentStatus === status ? "secondary" : "ghost"}
                size="sm"
                className={`rounded-lg px-4 h-9 text-xs font-medium capitalize transition-all duration-300 ${
                currentStatus === status
                    ? "bg-white shadow-sm text-black"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                }`}
                onClick={() => handleFilter(status)}
            >
                {status}
            </Button>
            ))}
        </div>
      </div>

      {/* Masonry Layout */}
      <AnimatePresence mode="popLayout">
        <motion.div
          className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
          layout
        >
          {/* New Interview Card - Always First */}
          {currentPage === 1 && !currentSearch && currentStatus === 'all' && (
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="break-inside-avoid mb-6"
            >
                <Link href="/dashboard/new" className="block w-full">
                <div
                    className="group relative overflow-hidden rounded-3xl border border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all duration-500 min-h-[300px] flex flex-col items-center justify-center cursor-pointer"
                >
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary transition-all duration-500">
                    <Plus className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors duration-500" />
                    </div>
                    <div className="text-center px-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:translate-y-[-2px] transition-transform duration-500">
                        New Interview
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-[200px] mx-auto group-hover:text-foreground/80 transition-colors duration-500">
                        Start a new AI-powered mock interview session
                    </p>
                    </div>
                </div>
                </Link>
            </motion.div>
          )}

          {interviews.map((interview, index) => (
            <motion.div
              key={interview._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
              className="break-inside-avoid mb-6"
            >
              <InterviewCardNew
                interview={interview}
                onDelete={() => handleDelete(interview._id)}
                isDeleting={isPending}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty state */}
      {interviews.length === 0 && (
        <motion.div
            className="flex flex-col items-center justify-center py-24 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="w-20 h-20 rounded-3xl bg-secondary/50 flex items-center justify-center mb-6 shadow-sm">
            <Search className="w-8 h-8 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No interviews found</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                We couldn&apos;t find any interviews matching your search filters.
            </p>
            <Button
                variant="outline"
                className="rounded-full px-6"
                onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete("search");
                    params.delete("status");
                    router.replace(`${pathname}?${params.toString()}`);
                }}
            >
                Clear all filters
            </Button>
        </motion.div>
      )}

      {/* Modern Pagination */}
      {totalPages > 1 && (
         <div className="flex items-center justify-center gap-4 py-8">
              <Button
                 variant="outline"
                 size="icon"
                 className="w-10 h-10 rounded-full border-border/60 hover:bg-secondary/80 hover:border-border transition-all duration-300"
                 disabled={currentPage <= 1}
                 onClick={() => handlePageChange(currentPage - 1)}
              >
                 <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-2 text-sm font-medium tabular-nums">
                 <span className="text-foreground">{currentPage}</span>
                 <span className="text-muted-foreground/50">/</span>
                 <span className="text-muted-foreground">{totalPages}</span>
              </div>

              <Button
                 variant="outline"
                 size="icon"
                 className="w-10 h-10 rounded-full border-border/60 hover:bg-secondary/80 hover:border-border transition-all duration-300"
                 disabled={currentPage >= totalPages}
                 onClick={() => handlePageChange(currentPage + 1)}
              >
                 <ChevronRight className="w-4 h-4" />
             </Button>
         </div>
      )}
    </div>
  );
}
