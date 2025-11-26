import { Skeleton } from "@/components/ui/skeleton";
import { Target, BookOpen, HelpCircle, Zap } from "lucide-react";

export default function InterviewLoading() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-secondary/20 pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />

      {/* Floating orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12" />
                  <div>
                    <Skeleton className="h-6 w-48 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-1.5 w-24" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-72 border-r border-border bg-sidebar/50 p-6 hidden lg:block">
            <div className="flex items-center gap-2 mb-6">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-5xl">
            {/* Module Progress */}
            <div className="border border-border bg-card/50 p-4">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-8" />
              </div>
              <div className="flex gap-2">
                {[Target, BookOpen, HelpCircle, Zap].map((Icon, i) => (
                  <div key={i} className="flex-1 p-3 border border-border">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 bg-secondary flex items-center justify-center">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Module Cards */}
            {[
              { title: "Opening Brief", icon: Target },
              { title: "Revision Topics", icon: BookOpen },
              { title: "Multiple Choice Questions", icon: HelpCircle },
              { title: "Rapid Fire Questions", icon: Zap },
            ].map((module, index) => (
              <div
                key={index}
                className="border border-border bg-card/80 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between p-6 pb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-secondary flex items-center justify-center">
                      <module.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
}
