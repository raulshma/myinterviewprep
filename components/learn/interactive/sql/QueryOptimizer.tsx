'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gauge, Zap, AlertTriangle, CheckCircle, Clock, Database, ArrowRight, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QueryOptimizerProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
}

interface QueryExample {
  id: string;
  label: string;
  badQuery: string;
  goodQuery: string;
  issue: string;
  improvement: string;
  badCost: number;
  goodCost: number;
}

const queryExamples: QueryExample[] = [
  {
    id: 'select-star',
    label: 'SELECT *',
    badQuery: 'SELECT * FROM Employees\nWHERE DepartmentID = 5;',
    goodQuery: 'SELECT EmployeeID, FirstName, LastName\nFROM Employees\nWHERE DepartmentID = 5;',
    issue: 'Retrieves ALL columns, wasting bandwidth and memory',
    improvement: 'Select only the columns you need',
    badCost: 85,
    goodCost: 25,
  },
  {
    id: 'no-index',
    label: 'Missing Index',
    badQuery: "SELECT * FROM Orders\nWHERE OrderDate = '2024-01-15';",
    goodQuery: "-- First create index:\n-- CREATE INDEX IX_Orders_Date ON Orders(OrderDate)\n\nSELECT OrderID, CustomerID, Total\nFROM Orders\nWHERE OrderDate = '2024-01-15';",
    issue: 'Full table scan on large table',
    improvement: 'Create an index on the filtered column',
    badCost: 95,
    goodCost: 15,
  },
  {
    id: 'subquery',
    label: 'Subquery in WHERE',
    badQuery: "SELECT * FROM Products\nWHERE CategoryID IN (\n  SELECT CategoryID FROM Categories\n  WHERE CategoryName = 'Electronics'\n);",
    goodQuery: "SELECT p.*\nFROM Products p\nJOIN Categories c ON p.CategoryID = c.CategoryID\nWHERE c.CategoryName = 'Electronics';",
    issue: 'Subquery may execute for every row',
    improvement: 'Use JOIN for better optimizer handling',
    badCost: 70,
    goodCost: 30,
  },
  {
    id: 'function-in-where',
    label: 'Function in WHERE',
    badQuery: "SELECT * FROM Employees\nWHERE YEAR(HireDate) = 2023;",
    goodQuery: "SELECT * FROM Employees\nWHERE HireDate >= '2023-01-01'\n  AND HireDate < '2024-01-01';",
    issue: 'Function prevents index usage (not SARGable)',
    improvement: 'Use range comparison to enable index',
    badCost: 80,
    goodCost: 20,
  },
];

function CostMeter({ cost, label }: { cost: number; label: string }) {
  const getColor = (c: number) => {
    if (c <= 30) return 'from-emerald-500 to-green-500';
    if (c <= 60) return 'from-yellow-500 to-orange-500';
    return 'from-orange-500 to-red-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className={cn(
          'font-medium',
          cost <= 30 ? 'text-emerald-400' : cost <= 60 ? 'text-yellow-400' : 'text-red-400'
        )}>
          {cost}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${cost}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn('h-full rounded-full bg-gradient-to-r', getColor(cost))}
        />
      </div>
    </div>
  );
}

export function QueryOptimizer({ mode = 'beginner' }: QueryOptimizerProps) {
  const [selectedExample, setSelectedExample] = useState<QueryExample>(queryExamples[0]);
  const [showComparison, setShowComparison] = useState(false);

  const visibleExamples = mode === 'beginner' 
    ? queryExamples.slice(0, 2) 
    : queryExamples;

  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-orange-500/20">
          <Gauge className="h-5 w-5 text-orange-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Query Optimizer</h3>
      </div>

      {/* Beginner Explanation */}
      {mode === 'beginner' && (
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 mb-6">
          <p className="text-white font-medium">Why Optimize Queries?</p>
          <p className="text-slate-400 text-sm mt-1">
            💡 Think of it like planning a road trip. You could take any route, but the fastest 
            one gets you there sooner and uses less gas. Database optimization finds the best &quot;route&quot; 
            for your data!
          </p>
        </div>
      )}

      {/* Example Selection */}
      <div className="flex flex-wrap gap-2 mb-6">
        {visibleExamples.map((example) => (
          <button
            key={example.id}
            onClick={() => {
              setSelectedExample(example);
              setShowComparison(false);
            }}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              selectedExample.id === example.id
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            )}
          >
            {example.label}
          </button>
        ))}
      </div>

      {/* Issue Description */}
      <motion.div
        key={selectedExample.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 mb-6"
      >
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Problem: {selectedExample.issue}</p>
            <p className="text-slate-400 text-sm mt-1">
              <Lightbulb className="h-4 w-4 inline mr-1 text-yellow-400" />
              {selectedExample.improvement}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Compare Button */}
      <button
        onClick={() => setShowComparison(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors mb-6"
      >
        <Zap className="h-4 w-4" />
        Compare Queries
      </button>

      {/* Side-by-Side Comparison */}
      <AnimatePresence>
        {showComparison && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid gap-4 md:grid-cols-2"
          >
            {/* Bad Query */}
            <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/30">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-red-400 font-medium text-sm">Slow Query</span>
              </div>
              <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap bg-slate-900/50 p-3 rounded mb-3 overflow-x-auto">
                {selectedExample.badQuery}
              </pre>
              <CostMeter cost={selectedExample.badCost} label="Relative Cost" />
            </div>

            {/* Good Query */}
            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400 font-medium text-sm">Optimized Query</span>
              </div>
              <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap bg-slate-900/50 p-3 rounded mb-3 overflow-x-auto">
                {selectedExample.goodQuery}
              </pre>
              <CostMeter cost={selectedExample.goodCost} label="Relative Cost" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance Improvement */}
      {showComparison && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 p-4 rounded-lg bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30"
        >
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-emerald-400" />
            <div>
              <span className="text-2xl font-bold text-emerald-400">
                {Math.round((selectedExample.badCost - selectedExample.goodCost) / selectedExample.badCost * 100)}%
              </span>
              <span className="text-slate-300 ml-2">faster with optimization!</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Optimization Rules (Intermediate+) */}
      {mode !== 'beginner' && (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {[
            { icon: Database, title: 'Index Key Columns', desc: 'WHERE, JOIN, ORDER BY columns' },
            { icon: Zap, title: 'Avoid SELECT *', desc: 'Select only needed columns' },
            { icon: Clock, title: 'SARGable Queries', desc: 'No functions on indexed columns' },
            { icon: CheckCircle, title: 'Use EXISTS', desc: 'Prefer EXISTS over COUNT for checks' },
          ].map((rule, idx) => (
            <motion.div
              key={rule.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30"
            >
              <rule.icon className="h-4 w-4 text-orange-400 mb-1" />
              <h4 className="text-white font-medium text-sm">{rule.title}</h4>
              <p className="text-slate-400 text-xs">{rule.desc}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Advanced: Execution Plans */}
      {mode === 'advanced' && (
        <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <h4 className="text-amber-400 font-medium mb-2">Reading Execution Plans</h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• <strong>Table Scan:</strong> No index used - reads entire table (bad)</li>
            <li>• <strong>Index Seek:</strong> Uses index efficiently (good)</li>
            <li>• <strong>Index Scan:</strong> Reads entire index (moderate)</li>
            <li>• <strong>Key Lookup:</strong> Extra step for non-covered columns</li>
            <li>• <strong>Cost %:</strong> Higher = more expensive operation</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default QueryOptimizer;
