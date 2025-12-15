'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Play, Eye, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WindowFunctionExplorerProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
}

interface SalesData {
  id: number;
  employee: string;
  department: string;
  amount: number;
  date: string;
}

const salesData: SalesData[] = [
  { id: 1, employee: 'Alice', department: 'East', amount: 5000, date: '2024-01' },
  { id: 2, employee: 'Bob', department: 'East', amount: 4000, date: '2024-01' },
  { id: 3, employee: 'Charlie', department: 'West', amount: 6000, date: '2024-01' },
  { id: 4, employee: 'Alice', department: 'East', amount: 5500, date: '2024-02' },
  { id: 5, employee: 'Bob', department: 'East', amount: 4500, date: '2024-02' },
  { id: 6, employee: 'Charlie', department: 'West', amount: 5800, date: '2024-02' },
];

type WindowFunction = 'row_number' | 'rank' | 'dense_rank' | 'lag' | 'lead' | 'sum_over' | 'avg_over';

const windowFunctions: Record<WindowFunction, {
  title: string;
  description: string;
  analogy: string;
  sql: string;
  color: string;
}> = {
  row_number: {
    title: 'ROW_NUMBER()',
    description: 'Assigns a unique sequential number to each row within a partition.',
    analogy: 'Like numbering students 1, 2, 3... in each classroom separately.',
    sql: 'SELECT employee, amount,\n  ROW_NUMBER() OVER (\n    PARTITION BY department\n    ORDER BY amount DESC\n  ) AS row_num\nFROM Sales',
    color: 'from-blue-500 to-blue-600',
  },
  rank: {
    title: 'RANK()',
    description: 'Like ROW_NUMBER but ties get the same rank, and next rank skips.',
    analogy: 'Like Olympic medals - if two tie for gold, the next is bronze (no silver).',
    sql: 'SELECT employee, amount,\n  RANK() OVER (\n    ORDER BY amount DESC\n  ) AS rank\nFROM Sales',
    color: 'from-yellow-500 to-yellow-600',
  },
  dense_rank: {
    title: 'DENSE_RANK()',
    description: 'Like RANK but no gaps - ties get same rank, next rank is consecutive.',
    analogy: 'Like class rankings - if two tie for 1st, the next is 2nd (not 3rd).',
    sql: 'SELECT employee, amount,\n  DENSE_RANK() OVER (\n    ORDER BY amount DESC\n  ) AS dense_rank\nFROM Sales',
    color: 'from-orange-500 to-orange-600',
  },
  lag: {
    title: 'LAG()',
    description: 'Access the value from a previous row in the result set.',
    analogy: 'Like looking back at last month\'s sales to compare.',
    sql: 'SELECT employee, date, amount,\n  LAG(amount, 1) OVER (\n    PARTITION BY employee\n    ORDER BY date\n  ) AS prev_amount\nFROM Sales',
    color: 'from-purple-500 to-purple-600',
  },
  lead: {
    title: 'LEAD()',
    description: 'Access the value from a following row in the result set.',
    analogy: 'Like peeking at next month\'s projected sales.',
    sql: 'SELECT employee, date, amount,\n  LEAD(amount, 1) OVER (\n    PARTITION BY employee\n    ORDER BY date\n  ) AS next_amount\nFROM Sales',
    color: 'from-pink-500 to-pink-600',
  },
  sum_over: {
    title: 'SUM() OVER',
    description: 'Running total within a partition.',
    analogy: 'Like a running tally of points as the game progresses.',
    sql: 'SELECT employee, date, amount,\n  SUM(amount) OVER (\n    PARTITION BY employee\n    ORDER BY date\n  ) AS running_total\nFROM Sales',
    color: 'from-green-500 to-green-600',
  },
  avg_over: {
    title: 'AVG() OVER',
    description: 'Average across the partition.',
    analogy: 'Like seeing the class average next to each student\'s score.',
    sql: 'SELECT employee, amount,\n  AVG(amount) OVER (\n    PARTITION BY department\n  ) AS dept_avg\nFROM Sales',
    color: 'from-teal-500 to-teal-600',
  },
};

function getWindowResults(fn: WindowFunction): { columns: string[]; rows: (string | number | null)[][] } {
  switch (fn) {
    case 'row_number': {
      const eastSorted = salesData.filter(s => s.department === 'East').sort((a, b) => b.amount - a.amount);
      const westSorted = salesData.filter(s => s.department === 'West').sort((a, b) => b.amount - a.amount);
      const rows = [
        ...eastSorted.map((s, i) => [s.employee, s.department, s.amount, i + 1]),
        ...westSorted.map((s, i) => [s.employee, s.department, s.amount, i + 1]),
      ];
      return { columns: ['employee', 'department', 'amount', 'row_num'], rows };
    }
    case 'rank':
    case 'dense_rank': {
      const sorted = [...salesData].sort((a, b) => b.amount - a.amount);
      let currentRank = 1;
      const rows = sorted.map((s, i, arr) => {
        if (i > 0 && s.amount < arr[i - 1].amount) {
          currentRank = fn === 'rank' ? i + 1 : currentRank + 1;
        }
        return [s.employee, s.amount, currentRank];
      });
      return { columns: ['employee', 'amount', fn === 'rank' ? 'rank' : 'dense_rank'], rows };
    }
    case 'lag': {
      const result: (string | number | null)[][] = [];
      ['Alice', 'Bob', 'Charlie'].forEach(emp => {
        const empData = salesData.filter(s => s.employee === emp).sort((a, b) => a.date.localeCompare(b.date));
        empData.forEach((s, i) => {
          result.push([s.employee, s.date, s.amount, i > 0 ? empData[i - 1].amount : null]);
        });
      });
      return { columns: ['employee', 'date', 'amount', 'prev_amount'], rows: result };
    }
    case 'lead': {
      const result: (string | number | null)[][] = [];
      ['Alice', 'Bob', 'Charlie'].forEach(emp => {
        const empData = salesData.filter(s => s.employee === emp).sort((a, b) => a.date.localeCompare(b.date));
        empData.forEach((s, i) => {
          result.push([s.employee, s.date, s.amount, i < empData.length - 1 ? empData[i + 1].amount : null]);
        });
      });
      return { columns: ['employee', 'date', 'amount', 'next_amount'], rows: result };
    }
    case 'sum_over': {
      const result: (string | number)[][] = [];
      ['Alice', 'Bob', 'Charlie'].forEach(emp => {
        const empData = salesData.filter(s => s.employee === emp).sort((a, b) => a.date.localeCompare(b.date));
        let runningTotal = 0;
        empData.forEach(s => {
          runningTotal += s.amount;
          result.push([s.employee, s.date, s.amount, runningTotal]);
        });
      });
      return { columns: ['employee', 'date', 'amount', 'running_total'], rows: result };
    }
    case 'avg_over': {
      const deptAvgs: Record<string, number> = {};
      ['East', 'West'].forEach(dept => {
        const deptData = salesData.filter(s => s.department === dept);
        deptAvgs[dept] = deptData.reduce((sum, s) => sum + s.amount, 0) / deptData.length;
      });
      const rows = salesData.map(s => [s.employee, s.department, s.amount, Math.round(deptAvgs[s.department])]);
      return { columns: ['employee', 'department', 'amount', 'dept_avg'], rows };
    }
    default:
      return { columns: [], rows: [] };
  }
}

export function WindowFunctionExplorer({ mode = 'beginner' }: WindowFunctionExplorerProps) {
  const [selectedFn, setSelectedFn] = useState<WindowFunction>('row_number');
  const [showResults, setShowResults] = useState(false);

  const runQuery = useCallback(() => {
    setShowResults(false);
    setTimeout(() => setShowResults(true), 300);
  }, []);

  const info = windowFunctions[selectedFn];
  const results = getWindowResults(selectedFn);

  return (
    <div className="space-y-6 p-4 bg-slate-950 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-blue-400" />
          Window Function Explorer
        </h3>
        <Button variant="outline" size="sm" onClick={runQuery}>
          <Play className="w-4 h-4 mr-1" />
          Run Query
        </Button>
      </div>

      {/* Function Selector */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(windowFunctions) as WindowFunction[]).map((fn) => (
          <Button
            key={fn}
            variant={selectedFn === fn ? "default" : "outline"}
            size="sm"
            onClick={() => { setSelectedFn(fn); setShowResults(false); }}
            className={cn(
              "transition-all text-xs",
              selectedFn === fn && `bg-gradient-to-r ${windowFunctions[fn].color} border-0`
            )}
          >
            {windowFunctions[fn].title}
          </Button>
        ))}
      </div>

      {/* Info Card */}
      <motion.div
        key={selectedFn}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("p-4 rounded-lg bg-gradient-to-r text-white", info.color)}
      >
        <h4 className="font-bold font-mono">{info.title}</h4>
        <p className="text-sm mt-1 opacity-90">{info.description}</p>
        {mode === 'beginner' && (
          <p className="text-sm mt-2 opacity-80 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {info.analogy}
          </p>
        )}
      </motion.div>

      {/* SQL Query */}
      <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
        <div className="px-4 py-2 bg-slate-800 font-bold text-white text-sm">SQL Query</div>
        <pre className="p-4 text-sm font-mono text-green-400 overflow-x-auto">{info.sql}</pre>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Source Data */}
        <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
          <div className="px-4 py-2 bg-slate-700 font-bold text-white text-sm">Sales (Source)</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-2 py-2 text-left">employee</th>
                  <th className="px-2 py-2 text-left">dept</th>
                  <th className="px-2 py-2 text-left">date</th>
                  <th className="px-2 py-2 text-right">amount</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((row) => (
                  <tr key={row.id} className="border-b border-slate-800 last:border-b-0">
                    <td className="px-2 py-1.5">{row.employee}</td>
                    <td className="px-2 py-1.5">{row.department}</td>
                    <td className="px-2 py-1.5">{row.date}</td>
                    <td className="px-2 py-1.5 text-right font-mono">${row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {showResults ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-slate-900 rounded-lg overflow-hidden border border-green-500/50"
            >
              <div className="px-4 py-2 bg-green-600 font-bold text-white text-sm flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Result ({results.rows.length} rows)
              </div>
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 sticky top-0 bg-slate-900">
                      {results.columns.map((col, i) => (
                        <th key={i} className={cn(
                          "px-2 py-2",
                          i === results.columns.length - 1 ? "text-right bg-green-500/20" : "text-left"
                        )}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.rows.map((row, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-slate-800 last:border-b-0"
                      >
                        {row.map((cell, j) => (
                          <td key={j} className={cn(
                            "px-2 py-1.5",
                            j === row.length - 1 ? "text-right font-mono font-bold text-green-400" : "",
                            cell === null && "text-slate-500 italic"
                          )}>
                            {cell === null ? 'NULL' : (typeof cell === 'number' && j !== row.length - 1 ? `$${cell}` : cell)}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <div className="bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center text-slate-500 p-8">
              Click &quot;Run Query&quot; to see results
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Beginner Tips */}
      {mode === 'beginner' && (
        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <h4 className="font-bold text-white mb-2">🎯 Window Functions vs GROUP BY</h4>
          <p className="text-sm text-slate-300">
            Unlike GROUP BY which reduces rows, <strong>window functions keep all rows</strong> and 
            add calculated columns. The <code className="px-1 bg-slate-800 rounded">PARTITION BY</code> clause 
            is like GROUP BY for calculations, and <code className="px-1 bg-slate-800 rounded">ORDER BY</code> 
            determines the sequence within each partition.
          </p>
        </div>
      )}
    </div>
  );
}

export default WindowFunctionExplorer;
