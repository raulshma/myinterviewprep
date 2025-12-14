'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertTriangle, CheckCircle, Clock, RotateCcw, Play, Database, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type PerformanceScenario = 'n-plus-one' | 'eager-loading' | 'no-tracking' | 'projection';

export interface PerformanceAnalyzerProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
  title?: string;
  initialScenario?: PerformanceScenario;
}

interface QueryStep {
  query: string;
  time: number;
  isOptimal?: boolean;
}

const scenarioData: Record<PerformanceScenario, {
  title: string;
  description: string;
  badCode: string;
  goodCode: string;
  badQueries: QueryStep[];
  goodQueries: QueryStep[];
}> = {
  'n-plus-one': {
    title: 'N+1 Problem',
    description: 'Loading related data in a loop causes many database round-trips.',
    badCode: `// ❌ N+1 Problem
var blogs = context.Blogs.ToList();
foreach (var blog in blogs)
{
    var posts = blog.Posts; // Lazy load
}`,
    goodCode: `// ✅ Eager Loading
var blogs = context.Blogs
    .Include(b => b.Posts)
    .ToList();`,
    badQueries: [
      { query: 'SELECT * FROM Blogs', time: 50 },
      { query: 'SELECT * FROM Posts WHERE BlogId = 1', time: 30 },
      { query: 'SELECT * FROM Posts WHERE BlogId = 2', time: 30 },
      { query: 'SELECT * FROM Posts WHERE BlogId = 3', time: 30 },
      { query: '... (N more queries)', time: 0 },
    ],
    goodQueries: [
      { query: 'SELECT b.*, p.* FROM Blogs b LEFT JOIN Posts p ON b.Id = p.BlogId', time: 80, isOptimal: true },
    ],
  },
  'eager-loading': {
    title: 'Eager vs Lazy Loading',
    description: 'Loading related data upfront vs on-demand.',
    badCode: `// ⚠️ Lazy Loading (disabled by default)
var blog = context.Blogs.Find(1);
var posts = blog.Posts; // Triggers query`,
    goodCode: `// ✅ Eager Loading with Include
var blog = context.Blogs
    .Include(b => b.Posts)
    .FirstOrDefault(b => b.Id == 1);`,
    badQueries: [
      { query: 'SELECT * FROM Blogs WHERE Id = 1', time: 40 },
      { query: 'SELECT * FROM Posts WHERE BlogId = 1', time: 35 },
    ],
    goodQueries: [
      { query: 'SELECT b.*, p.* FROM Blogs b LEFT JOIN Posts p ON b.Id = p.BlogId WHERE b.Id = 1', time: 55, isOptimal: true },
    ],
  },
  'no-tracking': {
    title: 'AsNoTracking for Read-Only',
    description: 'Skip change tracking overhead when you only need to read data.',
    badCode: `// ⚠️ Tracked query (default)
var blogs = context.Blogs.ToList();
// EF tracks all entities for changes`,
    goodCode: `// ✅ No tracking for read-only
var blogs = context.Blogs
    .AsNoTracking()
    .ToList();`,
    badQueries: [
      { query: 'SELECT * FROM Blogs', time: 50 },
      { query: '(Change tracking overhead)', time: 30 },
    ],
    goodQueries: [
      { query: 'SELECT * FROM Blogs (no tracking)', time: 40, isOptimal: true },
    ],
  },
  'projection': {
    title: 'Projection (Select Only What You Need)',
    description: 'Reduce data transfer by selecting only required columns.',
    badCode: `// ❌ Loading entire entity
var blogs = context.Blogs.ToList();
var titles = blogs.Select(b => b.Title);`,
    goodCode: `// ✅ Project in query
var titles = context.Blogs
    .Select(b => b.Title)
    .ToList();`,
    badQueries: [
      { query: 'SELECT Id, Title, Url, Content, Rating, ... FROM Blogs', time: 80 },
    ],
    goodQueries: [
      { query: 'SELECT Title FROM Blogs', time: 25, isOptimal: true },
    ],
  },
};

export function PerformanceAnalyzer({
  mode = 'beginner',
  title = 'EF Core Performance',
  initialScenario = 'n-plus-one',
}: PerformanceAnalyzerProps) {
  const [scenario, setScenario] = useState<PerformanceScenario>(initialScenario);
  const [showComparison, setShowComparison] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeQueryIndex, setActiveQueryIndex] = useState(-1);
  const [showOptimized, setShowOptimized] = useState(false);

  const config = scenarioData[scenario];

  const runDemo = useCallback(async () => {
    setIsRunning(true);
    setShowComparison(true);
    setShowOptimized(false);
    setActiveQueryIndex(-1);

    // Animate bad queries
    for (let i = 0; i < config.badQueries.length; i++) {
      setActiveQueryIndex(i);
      await new Promise(r => setTimeout(r, 600));
    }
    
    await new Promise(r => setTimeout(r, 800));
    
    // Show optimized
    setShowOptimized(true);
    setActiveQueryIndex(-1);
    
    // Animate good queries
    for (let i = 0; i < config.goodQueries.length; i++) {
      setActiveQueryIndex(i);
      await new Promise(r => setTimeout(r, 600));
    }

    setIsRunning(false);
  }, [config]);

  const reset = useCallback(() => {
    setShowComparison(false);
    setIsRunning(false);
    setActiveQueryIndex(-1);
    setShowOptimized(false);
  }, []);

  const totalBadTime = config.badQueries.reduce((sum, q) => sum + q.time, 0);
  const totalGoodTime = config.goodQueries.reduce((sum, q) => sum + q.time, 0);
  const improvement = Math.round((1 - totalGoodTime / totalBadTime) * 100);

  return (
    <Card className="my-4 overflow-hidden bg-gray-950 border-gray-800">
      <CardHeader className="pb-2 flex flex-row items-center justify-between bg-gray-900/50">
        <CardTitle className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-400" />
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          <select
            value={scenario}
            onChange={(e) => {
              setScenario(e.target.value as PerformanceScenario);
              reset();
            }}
            className="bg-gray-800 text-gray-300 text-xs rounded px-2 py-1 border border-gray-700"
          >
            <option value="n-plus-one">N+1 Problem</option>
            <option value="eager-loading">Eager Loading</option>
            <option value="no-tracking">AsNoTracking</option>
            <option value="projection">Projection</option>
          </select>
          <Button variant="ghost" size="sm" onClick={reset} className="text-gray-400 hover:text-white">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Beginner Analogy */}
        {mode === 'beginner' && (
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
            <h4 className="font-medium text-yellow-300 mb-2">⚡ {config.title}</h4>
            <p className="text-sm text-gray-400">{config.description}</p>
            {scenario === 'n-plus-one' && (
              <p className="text-sm text-gray-400 mt-2">
                🏃 Imagine going to the grocery store 10 times to buy 10 items, instead of making one trip with a shopping list!
              </p>
            )}
          </div>
        )}

        {/* Start Button */}
        {!showComparison && (
          <div className="text-center">
            <Button onClick={runDemo} disabled={isRunning} className="bg-yellow-600 hover:bg-yellow-700">
              <Play className="h-4 w-4 mr-2" />
              Compare Performance
            </Button>
          </div>
        )}

        {/* Comparison View */}
        <AnimatePresence>
          {showComparison && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 gap-4"
            >
              {/* Bad Approach */}
              <div className={cn(
                'p-4 rounded-lg border-2',
                showOptimized ? 'border-red-500/50 opacity-60' : 'border-red-500'
              )}>
                <div className="flex items-center gap-2 mb-3 text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Inefficient</span>
                </div>
                
                {mode !== 'beginner' && (
                  <pre className="text-xs font-mono text-gray-400 mb-3 overflow-x-auto">
                    {config.badCode}
                  </pre>
                )}

                <div className="space-y-2">
                  {config.badQueries.map((query, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0.3 }}
                      animate={{ 
                        opacity: !showOptimized && activeQueryIndex >= i ? 1 : 0.3,
                        scale: !showOptimized && activeQueryIndex === i ? 1.02 : 1
                      }}
                      className="flex items-center gap-2 p-2 bg-gray-900 rounded text-xs"
                    >
                      <Database className="h-3 w-3 text-gray-500 shrink-0" />
                      <span className="font-mono text-gray-400 truncate flex-1">{query.query}</span>
                      {query.time > 0 && (
                        <span className="text-red-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {query.time}ms
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between text-xs">
                  <span className="text-gray-400">Total Time:</span>
                  <span className="text-red-400 font-bold">{totalBadTime}ms</span>
                </div>
              </div>

              {/* Good Approach */}
              <div className={cn(
                'p-4 rounded-lg border-2',
                showOptimized ? 'border-green-500' : 'border-gray-700'
              )}>
                <div className="flex items-center gap-2 mb-3 text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Optimized</span>
                </div>
                
                {mode !== 'beginner' && (
                  <pre className="text-xs font-mono text-gray-400 mb-3 overflow-x-auto">
                    {config.goodCode}
                  </pre>
                )}

                <AnimatePresence>
                  {showOptimized && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      {config.goodQueries.map((query, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0.3 }}
                          animate={{ 
                            opacity: activeQueryIndex >= i ? 1 : 0.3,
                            scale: activeQueryIndex === i ? 1.02 : 1
                          }}
                          className={cn(
                            'flex items-center gap-2 p-2 rounded text-xs',
                            query.isOptimal ? 'bg-green-900/30 border border-green-700' : 'bg-gray-900'
                          )}
                        >
                          <Database className="h-3 w-3 text-green-500 shrink-0" />
                          <span className="font-mono text-gray-400 truncate flex-1">{query.query}</span>
                          <span className="text-green-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {query.time}ms
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {showOptimized && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 pt-3 border-t border-gray-700 flex justify-between text-xs"
                  >
                    <span className="text-gray-400">Total Time:</span>
                    <span className="text-green-400 font-bold">{totalGoodTime}ms</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Performance Improvement */}
        {showOptimized && !isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-linear-to-r from-green-900/30 to-yellow-900/30 rounded-lg border border-green-700"
          >
            <div className="flex items-center justify-center gap-4">
              <Zap className="h-6 w-6 text-yellow-400" />
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{improvement}% Faster!</div>
                <div className="text-sm text-gray-400">{totalBadTime}ms → {totalGoodTime}ms</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Advanced Tips */}
        {mode === 'advanced' && showOptimized && !isRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-gray-900 rounded-lg border border-gray-700"
          >
            <div className="text-xs font-medium text-gray-400 mb-2">🔧 Advanced Tips:</div>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Use <code className="text-cyan-400">.AsSplitQuery()</code> for complex includes</li>
              <li>• Monitor queries with <code className="text-cyan-400">ToQueryString()</code></li>
              <li>• Consider compiled queries for hot paths</li>
              <li>• Use <code className="text-cyan-400">DbContext pooling</code> for high-throughput</li>
            </ul>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

export default PerformanceAnalyzer;
