'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  AnimatedControls,
  type AnimationSpeed,
  speedMultipliers,
} from '@/components/learn/shared/animated-controls';

interface CodeStep {
  lineNumbers: number[];
  highlight: string;
  explanation: string;
}

interface DotnetCodePreviewProps {
  title: string;
  code: string;
  steps: CodeStep[];
  language?: 'csharp' | 'sql';
}

/**
 * DotnetCodePreview Component
 * Renders C# or SQL code with step-by-step highlighting and explanations
 * Validates: Requirements 4.3
 */
export function DotnetCodePreview({ 
  title, 
  code, 
  steps, 
  language = 'csharp' 
}: DotnetCodePreviewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<AnimationSpeed>('normal');
  const multiplier = speedMultipliers[speed];

  const lines = code.trim().split('\n');

  // Auto-advance through steps when playing
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
    }, 3000 * multiplier);

    return () => clearInterval(interval);
  }, [isPlaying, multiplier, steps.length]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleSpeedChange = useCallback((newSpeed: AnimationSpeed) => {
    setSpeed(newSpeed);
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
  }, []);

  const currentHighlightedLines = steps[currentStep]?.lineNumbers || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6 rounded-xl border border-border overflow-hidden bg-zinc-950"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <span className="ml-2 text-xs text-muted-foreground font-mono">
            {title}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {language === 'csharp' ? 'C#' : 'SQL'}
        </span>
      </div>

      {/* Code content */}
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-sm">
          {lines.map((line, i) => {
            const lineNum = i + 1;
            const isHighlighted = currentHighlightedLines.includes(lineNum);
            
            return (
              <motion.div
                key={i}
                className={cn(
                  'flex transition-colors duration-300',
                  isHighlighted && 'bg-primary/20 -mx-4 px-4 rounded'
                )}
                animate={{
                  backgroundColor: isHighlighted ? 'rgba(var(--primary), 0.2)' : 'transparent',
                }}
              >
                <span className="select-none text-muted-foreground/50 w-8 text-right mr-4 shrink-0">
                  {lineNum}
                </span>
                <code className="text-zinc-300">
                  <SyntaxHighlight code={line} language={language} />
                </code>
              </motion.div>
            );
          })}
        </pre>
      </div>

      {/* Step explanation */}
      <div className="px-4 py-3 border-t border-border bg-secondary/30">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-primary">
            Step {currentStep + 1} of {steps.length}
          </span>
          {steps[currentStep]?.highlight && (
            <span className="text-xs text-muted-foreground">
              — {steps[currentStep].highlight}
            </span>
          )}
        </div>
        <motion.p
          key={currentStep}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-foreground"
        >
          {steps[currentStep]?.explanation}
        </motion.p>
      </div>

      {/* Step navigation dots */}
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
        label="Step through code"
      />
    </motion.div>
  );
}


// Syntax highlighting for C# and SQL
function SyntaxHighlight({ code, language }: { code: string; language: 'csharp' | 'sql' }) {
  const csharpKeywords = [
    'using', 'namespace', 'class', 'public', 'private', 'protected', 'internal',
    'static', 'void', 'return', 'if', 'else', 'for', 'foreach', 'while', 'do',
    'switch', 'case', 'break', 'continue', 'new', 'this', 'base', 'null',
    'true', 'false', 'var', 'const', 'readonly', 'async', 'await', 'virtual',
    'override', 'abstract', 'sealed', 'interface', 'enum', 'struct', 'record',
    'get', 'set', 'init', 'where', 'select', 'from', 'orderby', 'group', 'into',
    'join', 'on', 'equals', 'let', 'ascending', 'descending', 'partial'
  ];

  const sqlKeywords = [
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET',
    'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'JOIN', 'INNER',
    'LEFT', 'RIGHT', 'OUTER', 'ON', 'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN',
    'LIKE', 'BETWEEN', 'ORDER', 'BY', 'ASC', 'DESC', 'GROUP', 'HAVING',
    'DISTINCT', 'AS', 'LIMIT', 'OFFSET', 'PRIMARY', 'KEY', 'FOREIGN',
    'REFERENCES', 'CONSTRAINT', 'DEFAULT', 'UNIQUE', 'CHECK', 'CASCADE'
  ];

  const csharpTypes = [
    'string', 'int', 'long', 'short', 'byte', 'float', 'double', 'decimal',
    'bool', 'char', 'object', 'dynamic', 'Task', 'List', 'Dictionary',
    'IEnumerable', 'IQueryable', 'DbContext', 'DbSet', 'Entity', 'ICollection'
  ];

  const sqlTypes = [
    'INT', 'INTEGER', 'VARCHAR', 'NVARCHAR', 'TEXT', 'CHAR', 'BOOLEAN',
    'BOOL', 'DATE', 'DATETIME', 'TIMESTAMP', 'DECIMAL', 'FLOAT', 'DOUBLE',
    'BIGINT', 'SMALLINT', 'TINYINT', 'BIT', 'UNIQUEIDENTIFIER', 'GUID'
  ];

  const keywords = language === 'csharp' ? csharpKeywords : sqlKeywords;
  const types = language === 'csharp' ? csharpTypes : sqlTypes;

  let result = code;

  // Escape HTML
  result = result.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Highlight strings
  result = result.replace(/(["'])(.*?)\1/g, '<span class="text-green-400">$1$2$1</span>');

  // Highlight keywords (case-insensitive for SQL)
  const keywordFlags = language === 'sql' ? 'gi' : 'g';
  keywords.forEach(kw => {
    result = result.replace(
      new RegExp(`\\b(${kw})\\b`, keywordFlags),
      '<span class="text-purple-400">$1</span>'
    );
  });

  // Highlight types
  types.forEach(t => {
    result = result.replace(
      new RegExp(`\\b(${t})\\b`, 'g'),
      '<span class="text-blue-400">$1</span>'
    );
  });

  // Highlight comments (C# style)
  if (language === 'csharp') {
    result = result.replace(/(\/\/.*$)/gm, '<span class="text-zinc-500">$1</span>');
  }

  // Highlight SQL comments
  if (language === 'sql') {
    result = result.replace(/(--.*$)/gm, '<span class="text-zinc-500">$1</span>');
  }

  // Highlight numbers
  result = result.replace(/\b(\d+)\b/g, '<span class="text-orange-400">$1</span>');

  // Highlight attributes/decorators in C#
  if (language === 'csharp') {
    result = result.replace(/(\[[\w\(\),\s="]+\])/g, '<span class="text-yellow-400">$1</span>');
  }

  return <span dangerouslySetInnerHTML={{ __html: result }} />;
}

export default DotnetCodePreview;
