import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ChatLoading() {
  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Left Panel - Content Preview */}
      <aside className="w-96 border-r border-border flex-col hidden lg:flex flex-shrink-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to topic</span>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-9 w-9" />
          </div>

          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[95%]" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[85%]" />
                <Skeleton className="h-4 w-[70%]" />
              </CardContent>
            </Card>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-5 w-32" />
              </div>
              <Card className="bg-muted border-border">
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[80%] mt-2" />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <Skeleton className="h-4 w-32 mb-3" />
            <div className="p-3 border border-border">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24 mt-1" />
            </div>
          </div>
        </div>
      </aside>

      {/* Right Panel - Chat */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b border-border p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="lg:hidden" disabled>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-8 h-8 border border-border flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-32 mt-1" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        </header>

        {/* Messages skeleton */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Welcome message skeleton */}
            <div className="flex justify-start">
              <div className="max-w-[85%]">
                <div className="bg-card border border-border p-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[90%]" />
                  <div className="py-1" />
                  <Skeleton className="h-4 w-[60%]" />
                  <Skeleton className="h-4 w-[70%]" />
                  <Skeleton className="h-4 w-[65%]" />
                  <Skeleton className="h-4 w-[75%]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions skeleton */}
        <div className="border-t border-border p-4 flex-shrink-0">
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-3 w-24 mb-3" />
            <div className="flex flex-wrap gap-2 mb-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        </div>

        {/* Input skeleton */}
        <div className="border-t border-border p-4 flex-shrink-0">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-3">
              <Skeleton className="h-11 flex-1" />
              <Skeleton className="h-11 w-11" />
            </div>
            <Skeleton className="h-3 w-64 mx-auto mt-2" />
          </div>
        </div>
      </main>
    </div>
  );
}
