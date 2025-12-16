'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Code2,
  Database,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AnimatedControls,
  type AnimationSpeed,
  speedMultipliers,
} from '@/components/learn/shared/animated-controls';

interface QueryStep {
  linq: string;
  sql: string;
  explanation: string;
  highlightLinq?: number[];
  highlightSql?: number[];
}

interface QueryExecutionVisualizerProps {
  steps: QueryStep[];
  title?: string;
}

/**
 * QueryExecutionVisualizer Component
 * Step-by-step visualization of LINQ to SQL translation
 * Validates: Requirements 9.3
 */
export function QueryExecutionVisualizer({ 
  steps,
  title = 'LINQ to SQL Translation'
}: QueryExecutionVisualizerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<AnimationSpeed>('normal');
  const [showTranslation, setShowTranslation] = useState(false);
  const multiplier = speedMultipliers[speed];

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 4000 * multiplier);

    return () => clearInterval(interval);
  }, [isPlaying, multiplier, steps.length]);

  // Show translation animation when step changes
  // Using a ref to track the previous step to avoid synchronous setState in effect
  const prevStepRef = useRef(currentStep);
  useEffect(() => {
    if (prevStepRef.current !== currentStep) {
      prevStepRef.current = currentStep;
      // Use a microtask to avoid synchronous setState warning
      const timer = setTimeout(() => {
        setShowTranslation(false);
        setTimeout(() => setShowTranslation(true), 500);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleSpeedChange = useCallback((newSpeed: AnimationSpeed) => {
    setSpeed(newSpeed);
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    setShowTranslation(false);
  }, []);

  const currentQuery = steps[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6 rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-secondary/30 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>

      {/* Query Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-0">
        {/* LINQ Side */}
        <div className="border-b lg:border-b-0 lg:border-r border-border">
          <div className="px-4 py-2 bg-purple-500/10 border-b border-border flex items-center gap-2">
            <Code2 className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-medium text-purple-500">LINQ Query (C#)</span>
          </div>
          <div className="p-4">
            <pre className="font-mono text-sm overflow-x-auto">
              <CodeWithHighlight 
                code={currentQuery.linq} 
                language="csharp"
                highlightLines={currentQuery.highlightLinq}
              />
            </pre>
          </div>
        </div>

        {/* SQL Side */}
        <div>
          <div className="px-4 py-2 bg-green-500/10 border-b border-border flex items-center gap-2">
            <Database className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-green-500">Generated SQL</span>
          </div>
          <div className="p-4 relative">
            <AnimatePresence mode="wait">
              {showTranslation ? (
                <motion.pre
                  key={`sql-${currentStep}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="font-mono text-sm overflow-x-auto"
                >
                  <CodeWithHighlight 
                    code={currentQuery.sql} 
                    language="sql"
                    highlightLines={currentQuery.highlightSql}
                  />
                </motion.pre>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-8"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Zap className="w-6 h-6 text-yellow-500" />
                  </motion.div>
                  <span className="ml-2 text-sm text-muted-foreground">Translating...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Translation Arrow (visible on larger screens) */}
      <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.div
          animate={showTranslation ? { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <ArrowRight className="w-8 h-8 text-primary" />
        </motion.div>
      </div>

      {/* Explanation */}
      <div className="px-4 py-3 border-t border-border bg-secondary/30">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentStep}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-sm text-foreground"
          >
            {currentQuery.explanation}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Step navigation */}
      <div className="px-4 py-2 border-t border-border bg-secondary/20 flex items-center justify-center gap-2">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentStep(i);
              setIsPlaying(false);
            }}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              i === currentStep ? 'bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            )}
            aria-label={`Go to step ${i + 1}`}
          />
        ))}
      </div>

      {/* Controls */}
      <AnimatedControls
        isPlaying={isPlaying}
        speed={speed}
        onPlayPause={handlePlayPause}
        onSpeedChange={handleSpeedChange}
        onReset={handleReset}
        label="Query translation"
      />
    </motion.div>
  );
}


interface CodeWithHighlightProps {
  code: string;
  language: 'csharp' | 'sql';
  highlightLines?: number[];
}

function CodeWithHighlight({ code, language, highlightLines = [] }: CodeWithHighlightProps) {
  const lines = code.trim().split('\n');

  return (
    <>
      {lines.map((line, i) => {
        const lineNum = i + 1;
        const isHighlighted = highlightLines.includes(lineNum);

        return (
          <motion.div
            key={i}
            className={cn(
              'transition-colors',
              isHighlighted && 'bg-yellow-500/20 -mx-4 px-4 rounded'
            )}
            animate={isHighlighted ? { backgroundColor: 'rgba(234, 179, 8, 0.2)' } : {}}
          >
            <code className="text-zinc-300">
              <SyntaxHighlight code={line} language={language} />
            </code>
          </motion.div>
        );
      })}
    </>
  );
}

function SyntaxHighlight({ code, language }: { code: string; language: 'csharp' | 'sql' }) {
  const csharpKeywords = [
    'var', 'from', 'where', 'select', 'orderby', 'join', 'on', 'equals',
    'into', 'let', 'group', 'by', 'ascending', 'descending', 'new',
    'await', 'async', 'return', 'true', 'false', 'null'
  ];

  const sqlKeywords = [
    'SELECT', 'FROM', 'WHERE', 'ORDER', 'BY', 'JOIN', 'INNER', 'LEFT',
    'RIGHT', 'ON', 'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'LIKE',
    'ASC', 'DESC', 'AS', 'DISTINCT', 'TOP', 'GROUP', 'HAVING', 'UNION'
  ];

  const keywords = language === 'csharp' ? csharpKeywords : sqlKeywords;

  let result = code;

  // Escape HTML
  result = result.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Highlight strings
  result = result.replace(/(["'])(.*?)\1/g, '<span class="text-green-400">$1$2$1</span>');

  // Highlight keywords
  const keywordFlags = language === 'sql' ? 'gi' : 'g';
  keywords.forEach(kw => {
    result = result.replace(
      new RegExp(`\\b(${kw})\\b`, keywordFlags),
      '<span class="text-purple-400">$1</span>'
    );
  });

  // Highlight method calls in C#
  if (language === 'csharp') {
    result = result.replace(/\.(\w+)\(/g, '.<span class="text-blue-400">$1</span>(');
  }

  // Highlight table/column names in SQL (after AS keyword)
  if (language === 'sql') {
    result = result.replace(/\[(\w+)\]/g, '<span class="text-blue-400">[$1]</span>');
  }

  // Highlight numbers
  result = result.replace(/\b(\d+)\b/g, '<span class="text-orange-400">$1</span>');

  // Highlight comments
  if (language === 'csharp') {
    result = result.replace(/(\/\/.*$)/gm, '<span class="text-zinc-500">$1</span>');
  }
  if (language === 'sql') {
    result = result.replace(/(--.*$)/gm, '<span class="text-zinc-500">$1</span>');
  }

  // Highlight lambda arrows in C#
  if (language === 'csharp') {
    result = result.replace(/=&gt;/g, '<span class="text-yellow-400">=&gt;</span>');
  }

  return <span dangerouslySetInnerHTML={{ __html: result }} />;
}

export default QueryExecutionVisualizer;
