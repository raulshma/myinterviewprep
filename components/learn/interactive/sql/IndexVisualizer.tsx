'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Search, Zap, TreeDeciduous, Clock, ArrowDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IndexVisualizerProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
}

interface BTreeNode {
  keys: number[];
  isLeaf: boolean;
  children?: BTreeNode[];
  highlighted?: boolean;
}

const sampleBTree: BTreeNode = {
  keys: [50],
  isLeaf: false,
  children: [
    {
      keys: [20, 35],
      isLeaf: false,
      children: [
        { keys: [10, 15], isLeaf: true },
        { keys: [25, 30], isLeaf: true },
        { keys: [40, 45], isLeaf: true },
      ],
    },
    {
      keys: [70, 85],
      isLeaf: false,
      children: [
        { keys: [55, 60], isLeaf: true },
        { keys: [75, 80], isLeaf: true },
        { keys: [90, 95], isLeaf: true },
      ],
    },
  ],
};

function BTreeVisualizer({ searchValue, animationStep }: { searchValue: number; animationStep: number }) {
  const getHighlightPath = (value: number): number[][] => {
    const path: number[][] = [];
    
    // Root level
    if (value <= 50) {
      path.push([0]); // Go left
      if (value <= 35) {
        path.push([0, 0]); // First child
        if (value <= 20) path.push([0, 0, 0]);
        else path.push([0, 0, 1]);
      } else {
        path.push([0, 1]); // Second child
      }
    } else {
      path.push([1]); // Go right
      if (value <= 70) {
        path.push([1, 0]);
      } else if (value <= 85) {
        path.push([1, 1]);
      } else {
        path.push([1, 2]);
      }
    }
    
    return path;
  };

  const highlightPath = useMemo(() => getHighlightPath(searchValue), [searchValue]);

  return (
    <div className="relative py-8">
      {/* Root Node */}
      <div className="flex justify-center mb-8">
        <motion.div
          animate={{
            scale: animationStep >= 0 ? [1, 1.1, 1] : 1,
            borderColor: animationStep >= 0 ? '#22c55e' : '#475569',
          }}
          transition={{ duration: 0.5 }}
          className="flex gap-1 p-2 rounded-lg bg-slate-800 border-2"
        >
          <div className="w-10 h-8 flex items-center justify-center rounded bg-slate-700 text-white font-mono text-sm">
            50
          </div>
        </motion.div>
      </div>

      {/* Level 1 */}
      <div className="flex justify-center gap-32 mb-8">
        {[{ keys: [20, 35], idx: 0 }, { keys: [70, 85], idx: 1 }].map((node, i) => (
          <motion.div
            key={i}
            animate={{
              scale: animationStep >= 1 && highlightPath[0]?.[0] === i ? [1, 1.1, 1] : 1,
              borderColor: animationStep >= 1 && highlightPath[0]?.[0] === i ? '#22c55e' : '#475569',
            }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex gap-1 p-2 rounded-lg bg-slate-800 border-2"
          >
            {node.keys.map((key, j) => (
              <div
                key={j}
                className="w-10 h-8 flex items-center justify-center rounded bg-slate-700 text-white font-mono text-sm"
              >
                {key}
              </div>
            ))}
          </motion.div>
        ))}
      </div>

      {/* Level 2 (Leaf nodes) */}
      <div className="flex justify-center gap-4">
        {[
          { keys: [10, 15], parent: 0 },
          { keys: [25, 30], parent: 0 },
          { keys: [40, 45], parent: 0 },
          { keys: [55, 60], parent: 1 },
          { keys: [75, 80], parent: 1 },
          { keys: [90, 95], parent: 1 },
        ].map((node, i) => {
          const isHighlighted = 
            animationStep >= 2 && 
            ((searchValue >= node.keys[0] - 5 && searchValue <= node.keys[1] + 5));
          
          return (
            <motion.div
              key={i}
              animate={{
                scale: isHighlighted ? [1, 1.1, 1] : 1,
                borderColor: isHighlighted ? '#22c55e' : '#475569',
                backgroundColor: isHighlighted ? 'rgba(34, 197, 94, 0.2)' : 'rgba(30, 41, 59, 1)',
              }}
              transition={{ duration: 0.5, delay: 1 }}
              className="flex gap-1 p-2 rounded-lg border-2"
            >
              {node.keys.map((key, j) => (
                <div
                  key={j}
                  className={cn(
                    'w-8 h-6 flex items-center justify-center rounded text-xs font-mono',
                    key === searchValue ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                  )}
                >
                  {key}
                </div>
              ))}
            </motion.div>
          );
        })}
      </div>

      {/* Connecting lines would go here in a full implementation */}
    </div>
  );
}

function PerformanceComparison({ rowCount }: { rowCount: number }) {
  const withoutIndex = rowCount; // Full table scan
  const withIndex = Math.ceil(Math.log2(rowCount)) + 1; // B-tree depth + 1
  
  const speedup = Math.round(withoutIndex / withIndex);

  return (
    <div className="grid gap-4 md:grid-cols-2 mt-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-4 rounded-lg bg-red-500/10 border border-red-500/30"
      >
        <div className="flex items-center gap-2 mb-2">
          <Search className="h-4 w-4 text-red-400" />
          <span className="text-red-400 font-medium">Without Index</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-red-400">{withoutIndex.toLocaleString()}</span>
          <span className="text-slate-400 text-sm">row reads (full scan)</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-700 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2 }}
            className="h-full bg-red-500"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30"
      >
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-emerald-400" />
          <span className="text-emerald-400 font-medium">With B-tree Index</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-emerald-400">{withIndex}</span>
          <span className="text-slate-400 text-sm">row reads ({speedup}x faster!)</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-700 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(withIndex / withoutIndex) * 100}%` }}
            transition={{ duration: 0.5, delay: 1 }}
            className="h-full bg-emerald-500"
          />
        </div>
      </motion.div>
    </div>
  );
}

export function IndexVisualizer({ mode = 'beginner' }: IndexVisualizerProps) {
  const [searchValue, setSearchValue] = useState<number>(75);
  const [rowCount, setRowCount] = useState<number>(1000000);
  const [isSearching, setIsSearching] = useState(false);
  const [animationStep, setAnimationStep] = useState(-1);

  const handleSearch = () => {
    setIsSearching(true);
    setAnimationStep(0);
    
    // Animate through B-tree levels
    setTimeout(() => setAnimationStep(1), 500);
    setTimeout(() => setAnimationStep(2), 1000);
    setTimeout(() => setIsSearching(false), 1500);
  };

  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-emerald-500/20">
          <TreeDeciduous className="h-5 w-5 text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Index Visualizer</h3>
      </div>

      {/* Beginner Explanation */}
      {mode === 'beginner' && (
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 mb-6">
          <p className="text-white font-medium">What is an Index?</p>
          <p className="text-slate-400 text-sm mt-1">
            💡 An index is like a book&apos;s index - instead of reading every page to find &quot;SQL&quot;, 
            you look up &quot;SQL&quot; in the index and jump directly to the right page!
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Search for value</label>
          <input
            type="number"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(parseInt(e.target.value) || 0);
              setAnimationStep(-1);
            }}
            min={10}
            max={95}
            className="w-24 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        
        {mode !== 'beginner' && (
          <div>
            <label className="block text-sm text-slate-400 mb-1">Table rows</label>
            <select
              value={rowCount}
              onChange={(e) => setRowCount(parseInt(e.target.value))}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={1000}>1,000</option>
              <option value={10000}>10,000</option>
              <option value={100000}>100,000</option>
              <option value={1000000}>1,000,000</option>
              <option value={10000000}>10,000,000</option>
            </select>
          </div>
        )}

        <div className="flex items-end">
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>
      </div>

      {/* B-tree Visualization */}
      <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <TreeDeciduous className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-400">B-tree Index Structure</span>
        </div>
        <BTreeVisualizer searchValue={searchValue} animationStep={animationStep} />
      </div>

      {/* Performance Comparison */}
      {animationStep >= 2 && (
        <PerformanceComparison rowCount={rowCount} />
      )}

      {/* Index Types (Intermediate+) */}
      {mode !== 'beginner' && (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <h4 className="text-blue-400 font-medium text-sm">Clustered Index</h4>
            <p className="text-slate-400 text-xs mt-1">
              Physically reorders table data. Only one per table. Like sorting a phone book alphabetically.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <h4 className="text-purple-400 font-medium text-sm">Non-Clustered Index</h4>
            <p className="text-slate-400 text-xs mt-1">
              Separate structure with pointers. Multiple per table. Like a book index that points to pages.
            </p>
          </div>
        </div>
      )}

      {/* Advanced: When NOT to use */}
      {mode === 'advanced' && (
        <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <h4 className="text-amber-400 font-medium mb-2">⚠️ When NOT to Use Indexes</h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• Small tables (&lt;1000 rows) - overhead exceeds benefit</li>
            <li>• High INSERT/UPDATE tables - indexes slow writes</li>
            <li>• Low cardinality columns (e.g., boolean, gender)</li>
            <li>• Columns rarely used in WHERE/JOIN/ORDER BY</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default IndexVisualizer;
