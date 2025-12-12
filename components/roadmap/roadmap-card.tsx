'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Map, Clock, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RoadmapCardProps {
  roadmap: {
    _id: string;
    slug: string;
    title: string;
    description: string;
    category: string;
    estimatedHours: number;
    nodes: unknown[];
  };
  progressPercent: number;
  isStarted: boolean;
}

export function RoadmapCard({ roadmap, progressPercent, isStarted }: RoadmapCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      router.push(`/roadmaps/${roadmap.slug}`);
    });
  };

  return (
    <article 
      onClick={handleClick}
      className={cn(
        "h-full p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-200 cursor-pointer group",
        isPending && "opacity-75 pointer-events-none"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "p-3 rounded-xl bg-primary/10 text-primary",
          isPending && "animate-pulse"
        )}>
          <Map className="w-6 h-6" />
        </div>
        <Badge variant="secondary">
          {roadmap.category}
        </Badge>
      </div>
      
      {/* Title */}
      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
        {roadmap.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {roadmap.description}
      </p>
      
      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4" />
          <span>{roadmap.nodes.length} topics</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>{roadmap.estimatedHours}h</span>
        </div>
      </div>
      
      {/* Progress */}
      {isStarted ? (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Progress</span>
            <span className="font-medium text-primary">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      ) : (
        <div className="h-[30px] mb-4" />
      )}
      
      {/* Action */}
      <Button 
        variant={isStarted ? 'default' : 'outline'} 
        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="ml-2">Loading...</span>
          </>
        ) : (
          <>
            {isStarted ? 'Continue Learning' : 'Start Learning'}
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
    </article>
  );
}
