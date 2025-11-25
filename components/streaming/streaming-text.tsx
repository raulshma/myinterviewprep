'use client';

import { useEffect, useState, useRef } from 'react';
import { type StreamableValue, readStreamableValue } from '@ai-sdk/rsc';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StreamingTextProps {
  stream: StreamableValue<string>;
  onComplete?: (text: string) => void;
  className?: string;
}

export function StreamingText({ stream, onComplete, className }: StreamingTextProps) {
  const [text, setText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const finalTextRef = useRef('');

  useEffect(() => {
    let isCancelled = false;

    async function readStream() {
      try {
        for await (const chunk of readStreamableValue(stream)) {
          if (isCancelled) break;
          if (chunk !== undefined) {
            setText(chunk);
            finalTextRef.current = chunk;
          }
        }
        if (!isCancelled) {
          setIsComplete(true);
          onComplete?.(finalTextRef.current);
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('whitespace-pre-wrap', className)}
    >
      {text}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="inline-block w-2 h-4 bg-primary ml-0.5 align-middle"
        />
      )}
    </motion.div>
  );
}
