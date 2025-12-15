'use client';

import { lazy, Suspense } from 'react';
import { CodeHighlighter } from '@/components/ui/code-highlighter';

// Lazy load MermaidDiagram for performance
const MermaidDiagram = lazy(() => 
  import('@/components/ui/mermaid-diagram').then(mod => ({ default: mod.MermaidDiagram }))
);

interface EnhancedCodeBlockProps {
  children: string;
  className?: string;
}

// Mermaid loading skeleton
function MermaidSkeleton() {
  return (
    <div className="my-6 rounded-xl border border-border/40 bg-background/50 p-8">
      <div className="flex items-center justify-center min-h-[150px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary/50 animate-pulse" />
          <div className="h-3 w-24 bg-secondary/40 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/**
 * Enhanced Code Block Component
 * Provides syntax highlighting and copy functionality for code blocks in MDX
 * Integrates with the enhanced CodeHighlighter component
 * Supports Mermaid diagrams with automatic detection
 */
export function EnhancedCodeBlock({ 
  children, 
  className
}: EnhancedCodeBlockProps) {
  // Extract language from className (e.g., "language-css" -> "css")
  const language = className?.replace(/language-/, '') || 'text';
  
  // Clean up the code content
  const code = typeof children === 'string' 
    ? children.trim() 
    : String(children).trim();

  // Handle mermaid diagrams
  if (language.toLowerCase() === 'mermaid') {
    return (
      <div className="my-6">
        <Suspense fallback={<MermaidSkeleton />}>
          <MermaidDiagram chart={code} showToolbar={true} />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="my-6">
      <CodeHighlighter
        code={code}
        language={language}
        showHeader={true}
        collapsible={true}
        className="rounded-xl"
      />
    </div>
  );
}
