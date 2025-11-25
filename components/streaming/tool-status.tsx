'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Sparkles, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToolStatusStep = 
  | 'idle'
  | 'searching'
  | 'reading'
  | 'generating'
  | 'complete';

interface ToolStatusProps {
  status: ToolStatusStep;
  searchQuery?: string;
  className?: string;
}

const statusConfig: Record<ToolStatusStep, {
  icon: typeof Search;
  label: string;
  color: string;
}> = {
  idle: {
    icon: Sparkles,
    label: 'Ready',
    color: 'bg-muted text-muted-foreground',
  },
  searching: {
    icon: Search,
    label: 'Searching Web',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  reading: {
    icon: FileText,
    label: 'Reading Results',
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  generating: {
    icon: Sparkles,
    label: 'Generating Answer',
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  },
  complete: {
    icon: Check,
    label: 'Complete',
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
};

const pillVariants = {
  initial: { opacity: 0, scale: 0.9, y: -4 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.15, ease: 'easeOut' as const }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: 4,
    transition: { duration: 0.1, ease: 'easeIn' as const }
  },
};

export function ToolStatus({ status, searchQuery, className }: ToolStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isActive = status !== 'idle' && status !== 'complete';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        variants={pillVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
          config.color,
          className
        )}
        style={{ viewTransitionName: 'tool-status' } as React.CSSProperties}
      >
        {isActive ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Icon className="h-3 w-3" />
        )}
        <span>{config.label}</span>
        {status === 'searching' && searchQuery && (
          <span className="text-muted-foreground truncate max-w-[120px]">
            "{searchQuery}"
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

interface ToolStatusTrailProps {
  steps: Array<{
    status: ToolStatusStep;
    query?: string;
    timestamp?: Date;
  }>;
  className?: string;
}

export function ToolStatusTrail({ steps, className }: ToolStatusTrailProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <AnimatePresence>
        {steps.map((step, index) => (
          <motion.div
            key={`${step.status}-${index}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: index * 0.1 }}
          >
            <ToolStatus 
              status={step.status} 
              searchQuery={step.query}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
