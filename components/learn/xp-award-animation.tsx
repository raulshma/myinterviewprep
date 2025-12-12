'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface XPAwardAnimationProps {
  amount: number | null;
  onComplete?: () => void;
}

/**
 * Animated XP award notification that appears when XP is earned
 * Shows a floating "+X XP" animation with sparkle effect
 * Auto-dismisses after the animation completes
 */
export function XPAwardAnimation({ amount, onComplete }: XPAwardAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayAmount, setDisplayAmount] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredRef = useRef(false);

  // Handle amount changes - show animation when amount becomes non-null
  useEffect(() => {
    if (amount !== null && amount > 0 && !hasTriggeredRef.current) {
      // New XP award - show animation
      hasTriggeredRef.current = true;
      setDisplayAmount(amount);
      setIsVisible(true);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Auto-dismiss after 2.5 seconds (animation + display time)
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        // Call onComplete after exit animation
        setTimeout(() => {
          onComplete?.();
          hasTriggeredRef.current = false;
        }, 300);
      }, 2500);
    } else if (amount === null) {
      // Reset for next animation
      hasTriggeredRef.current = false;
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [amount, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && displayAmount !== null && (
        <motion.div
          key="xp-award"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <motion.div
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 shadow-lg backdrop-blur-sm"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(234, 179, 8, 0)',
                '0 0 20px 10px rgba(234, 179, 8, 0.3)',
                '0 0 0 0 rgba(234, 179, 8, 0)',
              ],
            }}
            transition={{ duration: 1, repeat: 1 }}
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              <Sparkles className="w-5 h-5 text-yellow-500" />
            </motion.div>
            <span className="text-lg font-bold text-yellow-500">
              +{displayAmount} XP
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface XPAwardInlineProps {
  amount: number;
  show: boolean;
}

/**
 * Inline XP award animation for use within components (like quiz feedback)
 */
export function XPAwardInline({ amount, show }: XPAwardInlineProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ opacity: 0, scale: 0.5, x: -10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="inline-flex items-center gap-1 text-yellow-500 font-medium"
        >
          <motion.span
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 0.4 }}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </motion.span>
          +{amount} XP
        </motion.span>
      )}
    </AnimatePresence>
  );
}
