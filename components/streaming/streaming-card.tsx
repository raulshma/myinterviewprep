'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { type LucideIcon, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type StreamingCardStatus = 'idle' | 'loading' | 'streaming' | 'complete' | 'error';

interface StreamingCardProps {
  title: string;
  icon: LucideIcon;
  status: StreamingCardStatus;
  children: React.ReactNode;
  onAddMore?: () => void;
  addMoreLabel?: string;
  errorMessage?: string;
  className?: string;
}

const statusVariants = {
  idle: { opacity: 0.7 },
  loading: { opacity: 1 },
  streaming: { opacity: 1 },
  complete: { opacity: 1 },
  error: { opacity: 1 },
};

const contentVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' as const }
  },
  exit: { 
    opacity: 0, 
    y: -8,
    transition: { duration: 0.15, ease: 'easeIn' as const }
  },
};

export function StreamingCard({
  title,
  icon: Icon,
  status,
  children,
  onAddMore,
  addMoreLabel = 'Add More',
  errorMessage,
  className,
}: StreamingCardProps) {
  const isLoading = status === 'loading';
  const isStreaming = status === 'streaming';
  const isComplete = status === 'complete';
  const isError = status === 'error';


  return (
    <motion.div
      initial="idle"
      animate={status}
      variants={statusVariants}
      className={cn('h-full', className)}
    >
      <Card className={cn(
        'h-full transition-colors duration-200',
        isError && 'border-destructive/50',
        (isLoading || isStreaming) && 'border-primary/30'
      )}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <motion.div
              animate={isLoading || isStreaming ? { rotate: 360 } : { rotate: 0 }}
              transition={isLoading || isStreaming ? { 
                duration: 1, 
                repeat: Infinity, 
                ease: 'linear' 
              } : {}}
            >
              {isLoading || isStreaming ? (
                <Loader2 className="h-5 w-5 text-primary" />
              ) : isError ? (
                <AlertCircle className="h-5 w-5 text-destructive" />
              ) : (
                <Icon className="h-5 w-5 text-muted-foreground" />
              )}
            </motion.div>
            <CardTitle>{title}</CardTitle>
          </div>
          {isComplete && onAddMore && (
            <CardAction>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddMore}
              >
                {addMoreLabel}
              </Button>
            </CardAction>
          )}
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="skeleton"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-3"
              >
                <div className="h-4 bg-muted rounded skeleton-pulse w-3/4" />
                <div className="h-4 bg-muted rounded skeleton-pulse w-full" />
                <div className="h-4 bg-muted rounded skeleton-pulse w-2/3" />
              </motion.div>
            )}
            {isError && (
              <motion.div
                key="error"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-destructive text-sm"
              >
                {errorMessage || 'An error occurred while generating content.'}
              </motion.div>
            )}
            {(status === 'idle' || isStreaming || isComplete) && (
              <motion.div
                key="content"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ viewTransitionName: 'streaming-content' } as React.CSSProperties}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
