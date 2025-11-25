'use client';

import { useEffect, useState, useRef, type ReactNode } from 'react';
import { type StreamableValue, readStreamableValue } from '@ai-sdk/rsc';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StreamingListProps<T> {
  stream: StreamableValue<T[]>;
  renderItem: (item: T, index: number) => ReactNode;
  onComplete?: (items: T[]) => void;
  className?: string;
  itemClassName?: string;
  keyExtractor?: (item: T, index: number) => string;
}

const itemVariants = {
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

export function StreamingList<T>({
  stream,
  renderItem,
  onComplete,
  className,
  itemClassName,
  keyExtractor,
}: StreamingListProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const finalItemsRef = useRef<T[]>([]);

  useEffect(() => {
    let isCancelled = false;

    async function readStream() {
      try {
        for await (const chunk of readStreamableValue(stream)) {
          if (isCancelled) break;
          if (chunk !== undefined && Array.isArray(chunk)) {
            // Use View Transitions API if available
            if (typeof document !== 'undefined' && 'startViewTransition' in document) {
              (document as Document & { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
                setItems(chunk);
              });
            } else {
              setItems(chunk);
            }
            finalItemsRef.current = chunk;
          }
        }
        if (!isCancelled) {
          setIsComplete(true);
          onComplete?.(finalItemsRef.current);
        }
      } catch (error) {
        console.error('Error reading stream:', error);
      }
    }

    readStream();

    return () => {
      isCancelled = true;
    };
  }, [stream, onComplete]);

  const getKey = (item: T, index: number): string => {
    if (keyExtractor) {
      return keyExtractor(item, index);
    }
    // Try to use common id fields
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      if ('id' in obj && typeof obj.id === 'string') {
        return obj.id;
      }
      if ('_id' in obj && typeof obj._id === 'string') {
        return obj._id;
      }
    }
    return `item-${index}`;
  };

  return (
    <div className={cn('space-y-3', className)}>
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={getKey(item, index)}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
            className={itemClassName}
            style={{ viewTransitionName: `streaming-item-${getKey(item, index)}` } as React.CSSProperties}
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </AnimatePresence>
      {!isComplete && items.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-muted-foreground text-sm"
        >
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-primary"
          />
          Loading more...
        </motion.div>
      )}
    </div>
  );
}
