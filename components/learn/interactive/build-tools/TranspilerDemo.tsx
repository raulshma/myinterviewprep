'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Code2, ArrowRight, Settings, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface BrowserTargets {
  chrome?: number;
  firefox?: number;
  safari?: number;
  edge?: number;
  ie?: number;
}

export interface TransformationApplied {
  type: string;
  original: string;
  transformed: string;
  line: number;
  reason: string;
}

export interface TranspilationResult {
  output: string;
  transformations: TransformationApplied[];
  sourceMap?: string;
}

export interface TranspilerDemoProps {
  /** Initial code to transpile */
  initialCode?: string;
  /** Target browser configuration */
  targets?: BrowserTargets;
  /** Whether to show transformation highlights */
  showHighlights?: boolean;
}

const defaultCode = `// Modern JavaScript features
const greet = (name) => {
  return \`Hello, \${name}!\`;
};

class User {
  constructor(name) {
    this.name = name;
  }
  
  async fetchData() {
    const response = await fetch('/api/user');
    const data = await response.json();
    return data;
  }
}

const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const [first, ...rest] = numbers;

export { greet, User };`;

const browserPresets = {
  modern: {
    name: 'Modern Browsers',
    targets: { chrome: 90, firefox: 88, safari: 14, edge: 90 },
  },
  mainstream: {
    name: 'Mainstream',
    targets: { chrome: 70, firefox: 65, safari: 12, edge: 79 },
  },
  legacy: {
    name: 'Legacy (IE11)',
    targets: { chrome: 50, firefox: 50, safari: 10, edge: 15, ie: 11 },
  },
};

/**
 * Simulate transpilation by detecting modern features and showing transformations
 */
function transpileCode(code: string, targets: BrowserTargets): TranspilationResult {
  const transformations: TransformationApplied[] = [];
  let output = code;
  const lines = code.split('\n');

  // Determine if we need transformations based on targets
  const needsLegacySupport = targets.ie !== undefined || 
    (targets.chrome !== undefined && targets.chrome < 60) ||
    (targets.safari !== undefined && targets.safari < 12);

  const needsModernSupport = targets.chrome !== undefined && targets.chrome < 80;

  // Arrow functions
  const arrowFunctionRegex = /const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*{/g;
  if (needsLegacySupport) {
    let match;
    while ((match = arrowFunctionRegex.exec(code)) !== null) {
      const [fullMatch, funcName, params] = match;
      const lineNumber = code.substring(0, match.index).split('\n').length;
      
      transformations.push({
        type: 'Arrow Function',
        original: fullMatch,
        transformed: `var ${funcName} = function(${params}) {`,
        line: lineNumber,
        reason: 'Arrow functions not supported in IE11',
      });
    }
    
    output = output.replace(arrowFunctionRegex, 'var $1 = function($2) {');
  }

  // Template literals
  const templateLiteralRegex = /`([^`]*\$\{[^}]+\}[^`]*)`/g;
  if (needsLegacySupport) {
    let match;
    while ((match = templateLiteralRegex.exec(code)) !== null) {
      const lineNumber = code.substring(0, match.index).split('\n').length;
      
      transformations.push({
        type: 'Template Literal',
        original: match[0],
        transformed: '&quot;Hello, &quot; + name + &quot;!&quot;',
        line: lineNumber,
        reason: 'Template literals not supported in older browsers',
      });
    }
    
    output = output.replace(/`Hello, \$\{(\w+)\}!`/g, '"Hello, " + $1 + "!"');
  }

  // Classes
  const classRegex = /class\s+(\w+)\s*{/g;
  if (needsLegacySupport) {
    let match;
    while ((match = classRegex.exec(code)) !== null) {
      const lineNumber = code.substring(0, match.index).split('\n').length;
      
      transformations.push({
        type: 'Class',
        original: match[0],
        transformed: `function ${match[1]}() {`,
        line: lineNumber,
        reason: 'ES6 classes not supported in IE11',
      });
    }
    
    output = output.replace(classRegex, 'function $1() {');
  }

  // Async/await
  const asyncRegex = /async\s+(\w+)\s*\(/g;
  if (needsLegacySupport || needsModernSupport) {
    let match;
    while ((match = asyncRegex.exec(code)) !== null) {
      const lineNumber = code.substring(0, match.index).split('\n').length;
      
      transformations.push({
        type: 'Async/Await',
        original: match[0],
        transformed: `${match[1]}(`,
        line: lineNumber,
        reason: 'Async/await requires polyfill or transformation to promises',
      });
    }
  }

  // Destructuring
  const destructuringRegex = /const\s+\[([^\]]+)\]\s*=/g;
  if (needsLegacySupport) {
    let match;
    while ((match = destructuringRegex.exec(code)) !== null) {
      const lineNumber = code.substring(0, match.index).split('\n').length;
      
      transformations.push({
        type: 'Destructuring',
        original: match[0],
        transformed: 'var first = numbers[0]; var rest = numbers.slice(1);',
        line: lineNumber,
        reason: 'Array destructuring not supported in IE11',
      });
    }
    
    output = output.replace(/const\s+\[first,\s*\.\.\.rest\]\s*=\s*numbers;/, 
      'var first = numbers[0];\nvar rest = numbers.slice(1);');
  }

  // Const/let to var
  if (needsLegacySupport) {
    output = output.replace(/\bconst\b/g, 'var');
    output = output.replace(/\blet\b/g, 'var');
  }

  // Export statements
  const exportRegex = /export\s+{([^}]+)};/g;
  if (needsLegacySupport) {
    let match;
    while ((match = exportRegex.exec(code)) !== null) {
      const lineNumber = code.substring(0, match.index).split('\n').length;
      
      transformations.push({
        type: 'ES6 Modules',
        original: match[0],
        transformed: 'module.exports = { greet: greet, User: User };',
        line: lineNumber,
        reason: 'ES6 modules not supported, using CommonJS',
      });
    }
    
    output = output.replace(exportRegex, 'module.exports = { $1 };');
  }

  return {
    output,
    transformations,
  };
}

/**
 * TranspilerDemo Component
 * Interactive transpilation demonstration with browser target selection
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */
export function TranspilerDemo({
  initialCode = defaultCode,
  targets: initialTargets = browserPresets.modern.targets,
  showHighlights = true,
}: TranspilerDemoProps) {
  const [code, setCode] = useState(initialCode);
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof browserPresets>('modern');
  const [targets, setTargets] = useState<BrowserTargets>(initialTargets);
  const [selectedTransformation, setSelectedTransformation] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const result = useMemo(() => {
    return transpileCode(code, targets);
  }, [code, targets]);

  const handlePresetChange = useCallback((preset: keyof typeof browserPresets) => {
    setSelectedPreset(preset);
    setTargets(browserPresets[preset].targets);
  }, []);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  const handleReset = useCallback(() => {
    setCode(defaultCode);
    setSelectedPreset('modern');
    setTargets(browserPresets.modern.targets);
    setSelectedTransformation(null);
  }, []);

  return (
    <Card className="w-full max-w-6xl mx-auto my-8 overflow-hidden" role="region" aria-label="Transpiler Demo">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary" aria-hidden="true" />
            <h3 className="font-semibold" id="transpiler-title">Transpiler Demo</h3>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1" id="transpiler-description">
          See how modern JavaScript is transformed for browser compatibility
        </p>
      </div>

      {/* Browser Target Selector */}
      <div className="px-6 py-4 border-b border-border bg-secondary/10">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm font-medium" id="target-label">Target Browsers:</span>
        </div>
        <div className="flex gap-2" role="radiogroup" aria-labelledby="target-label">
          {Object.entries(browserPresets).map(([key, preset], index) => (
            <button
              key={key}
              onClick={() => handlePresetChange(key as keyof typeof browserPresets)}
              onKeyDown={(e) => {
                const presetKeys = Object.keys(browserPresets) as (keyof typeof browserPresets)[];
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  const nextIndex = (index + 1) % presetKeys.length;
                  handlePresetChange(presetKeys[nextIndex]);
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                  e.preventDefault();
                  const prevIndex = (index - 1 + presetKeys.length) % presetKeys.length;
                  handlePresetChange(presetKeys[prevIndex]);
                }
              }}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                selectedPreset === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              )}
              role="radio"
              aria-checked={selectedPreset === key}
              aria-label={`Target: ${preset.name}`}
              tabIndex={selectedPreset === key ? 0 : -1}
            >
              {preset.name}
            </button>
          ))}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {Object.entries(targets).map(([browser, version]) => (
            <span key={browser} className="mr-3">
              {browser}: {version}+
            </span>
          ))}
        </div>
      </div>

      {/* Transformation Count */}
      {result.transformations.length > 0 && (
        <div className="px-6 py-3 bg-yellow-500/10 border-b border-yellow-500/30">
          <div className="flex items-center gap-2 text-yellow-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">
              {result.transformations.length} transformation{result.transformations.length > 1 ? 's' : ''} applied
            </span>
          </div>
        </div>
      )}

      {/* Split Pane Editor */}
      <div className="grid lg:grid-cols-2 gap-0">
        {/* Input */}
        <div className="p-6 border-r border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Modern JavaScript</h4>
            <span className="text-xs text-muted-foreground">Input</span>
          </div>
          <Textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="font-mono text-sm min-h-[400px] resize-none"
            placeholder="Enter modern JavaScript code..."
            aria-label="Modern JavaScript input"
            aria-describedby="transpiler-description"
          />
        </div>

        {/* Output */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Transpiled Output</h4>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Output</span>
            </div>
          </div>
          <div className="relative">
            <pre 
              className="font-mono text-sm bg-black/90 text-green-400 p-4 rounded-lg min-h-[400px] overflow-auto"
              role="region"
              aria-label="Transpiled output"
              aria-live="polite"
            >
              {result.output}
            </pre>
          </div>
        </div>
      </div>

      {/* Transformations List */}
      {showHighlights && result.transformations.length > 0 && (
        <div className="px-6 py-4 border-t border-border bg-secondary/10">
          <h4 className="text-sm font-medium mb-3">Transformations Applied</h4>
          <div className="space-y-2">
            <AnimatePresence>
              {result.transformations.map((transform, index) => (
                <motion.div
                  key={index}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { delay: index * 0.05 }}
                  onClick={() => setSelectedTransformation(
                    selectedTransformation === index ? null : index
                  )}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedTransformation(
                        selectedTransformation === index ? null : index
                      );
                    }
                  }}
                  className={cn(
                    'p-3 rounded-lg border cursor-pointer transition-all',
                    selectedTransformation === index
                      ? 'bg-primary/10 border-primary/50'
                      : 'bg-secondary/50 border-border hover:bg-secondary'
                  )}
                  role="button"
                  tabIndex={0}
                  aria-expanded={selectedTransformation === index}
                  aria-label={`${transform.type} transformation on line ${transform.line}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-primary">
                          {transform.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Line {transform.line}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {transform.reason}
                      </p>
                      
                      <AnimatePresence>
                        {selectedTransformation === index && (
                          <motion.div
                            initial={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
                            transition={shouldReduceMotion ? { duration: 0 } : undefined}
                            className="space-y-2 overflow-hidden"
                          >
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Original:
                              </p>
                              <code className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded block">
                                {transform.original}
                              </code>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Transformed:
                              </p>
                              <code className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded block">
                                {transform.transformed}
                              </code>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Info */}
      {result.transformations.length === 0 && (
        <div className="px-6 py-4 border-t border-border bg-secondary/10">
          <div className="text-center py-4">
            <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">
              No transformations needed for these browser targets
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try selecting &quot;Legacy (IE11)&quot; to see transformations
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

export default TranspilerDemo;
