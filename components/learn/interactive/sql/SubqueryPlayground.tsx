'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ChevronRight, Play, Eye, Code, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SubqueryPlaygroundProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
}

interface Employee {
  id: number;
  name: string;
  department: string;
  salary: number;
}

const employees: Employee[] = [
  { id: 1, name: 'Alice', department: 'Engineering', salary: 85000 },
  { id: 2, name: 'Bob', department: 'Marketing', salary: 65000 },
  { id: 3, name: 'Charlie', department: 'Engineering', salary: 95000 },
  { id: 4, name: 'Diana', department: 'Sales', salary: 70000 },
  { id: 5, name: 'Eve', department: 'Engineering', salary: 78000 },
  { id: 6, name: 'Frank', department: 'Marketing', salary: 72000 },
];

type SubqueryType = 'scalar' | 'column' | 'row' | 'table' | 'correlated';

const subqueryTypes: Record<SubqueryType, {
  title: string;
  description: string;
  analogy: string;
  mainQuery: string;
  subQuery: string;
  color: string;
}> = {
  scalar: {
    title: 'Scalar Subquery',
    description: 'Returns a single value (one row, one column).',
    analogy: 'Like asking "What is the average salary?" and getting one number back.',
    mainQuery: 'SELECT name, salary FROM Employees\nWHERE salary > (',
    subQuery: '  SELECT AVG(salary) FROM Employees',
    color: 'from-blue-500 to-blue-600',
  },
  column: {
    title: 'Column Subquery',
    description: 'Returns a single column with multiple rows.',
    analogy: 'Like getting a list of all department names to check against.',
    mainQuery: 'SELECT name FROM Employees\nWHERE department IN (',
    subQuery: '  SELECT department FROM Employees\n  WHERE salary > 75000',
    color: 'from-green-500 to-green-600',
  },
  row: {
    title: 'Row Subquery',
    description: 'Returns a single row with multiple columns.',
    analogy: 'Like finding the employee with the max salary and all their details.',
    mainQuery: 'SELECT * FROM Employees\nWHERE (department, salary) = (',
    subQuery: '  SELECT department, MAX(salary)\n  FROM Employees\n  GROUP BY department\n  LIMIT 1',
    color: 'from-purple-500 to-purple-600',
  },
  table: {
    title: 'Table Subquery',
    description: 'Returns a full table (multiple rows and columns).',
    analogy: 'Like creating a temporary filtered table to work with.',
    mainQuery: 'SELECT dept_name, avg_salary FROM (',
    subQuery: '  SELECT department AS dept_name,\n    AVG(salary) AS avg_salary\n  FROM Employees\n  GROUP BY department',
    color: 'from-orange-500 to-orange-600',
  },
  correlated: {
    title: 'Correlated Subquery',
    description: 'References the outer query - runs once per outer row.',
    analogy: 'Like checking each employee against their own department\'s average.',
    mainQuery: 'SELECT name, salary, department\nFROM Employees e1\nWHERE salary > (',
    subQuery: '  SELECT AVG(salary) FROM Employees e2\n  WHERE e2.department = e1.department',
    color: 'from-red-500 to-red-600',
  },
};

function getSubqueryResults(type: SubqueryType): { subResult: string; mainResult: Employee[] } {
  const avgSalary = employees.reduce((sum, e) => sum + e.salary, 0) / employees.length;
  
  switch (type) {
    case 'scalar':
      return {
        subResult: `$${avgSalary.toFixed(0)}`,
        mainResult: employees.filter(e => e.salary > avgSalary),
      };
    case 'column': {
      const highEarnerDepts = [...new Set(employees.filter(e => e.salary > 75000).map(e => e.department))];
      return {
        subResult: highEarnerDepts.join(', '),
        mainResult: employees.filter(e => highEarnerDepts.includes(e.department)),
      };
    }
    case 'row': {
      const maxSalary = Math.max(...employees.map(e => e.salary));
      const topEarner = employees.find(e => e.salary === maxSalary)!;
      return {
        subResult: `(${topEarner.department}, $${topEarner.salary})`,
        mainResult: [topEarner],
      };
    }
    case 'table': {
      const deptAvgs: { dept_name: string; avg_salary: number }[] = [];
      const depts = [...new Set(employees.map(e => e.department))];
      depts.forEach(d => {
        const deptEmps = employees.filter(e => e.department === d);
        const avg = deptEmps.reduce((sum, e) => sum + e.salary, 0) / deptEmps.length;
        deptAvgs.push({ dept_name: d, avg_salary: avg });
      });
      return {
        subResult: deptAvgs.map(d => `${d.dept_name}: $${d.avg_salary.toFixed(0)}`).join('\n'),
        mainResult: [],
      };
    }
    case 'correlated': {
      const result: Employee[] = [];
      employees.forEach(e => {
        const deptEmps = employees.filter(d => d.department === e.department);
        const deptAvg = deptEmps.reduce((sum, d) => sum + d.salary, 0) / deptEmps.length;
        if (e.salary > deptAvg) {
          result.push(e);
        }
      });
      return {
        subResult: 'Varies per row',
        mainResult: result,
      };
    }
    default:
      return { subResult: '', mainResult: [] };
  }
}

export function SubqueryPlayground({ mode = 'beginner' }: SubqueryPlaygroundProps) {
  const [selectedType, setSelectedType] = useState<SubqueryType>('scalar');
  const [showExecution, setShowExecution] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);

  const runQuery = useCallback(() => {
    setShowExecution(false);
    setExecutionStep(0);
    setTimeout(() => {
      setShowExecution(true);
      setExecutionStep(1);
      setTimeout(() => setExecutionStep(2), 800);
      setTimeout(() => setExecutionStep(3), 1600);
    }, 100);
  }, []);

  const info = subqueryTypes[selectedType];
  const results = getSubqueryResults(selectedType);

  return (
    <div className="space-y-6 p-4 bg-slate-950 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" />
          Subquery Playground
        </h3>
        <Button variant="outline" size="sm" onClick={runQuery}>
          <Play className="w-4 h-4 mr-1" />
          Execute
        </Button>
      </div>

      {/* Type Selector */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(subqueryTypes) as SubqueryType[]).map((type) => (
          <Button
            key={type}
            variant={selectedType === type ? "default" : "outline"}
            size="sm"
            onClick={() => { setSelectedType(type); setShowExecution(false); }}
            className={cn(
              "transition-all",
              selectedType === type && `bg-gradient-to-r ${subqueryTypes[type].color} border-0`
            )}
          >
            {subqueryTypes[type].title}
          </Button>
        ))}
      </div>

      {/* Info Card */}
      <motion.div
        key={selectedType}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("p-4 rounded-lg bg-gradient-to-r text-white", info.color)}
      >
        <h4 className="font-bold">{info.title}</h4>
        <p className="text-sm mt-1 opacity-90">{info.description}</p>
        {mode === 'beginner' && (
          <p className="text-sm mt-2 opacity-80 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {info.analogy}
          </p>
        )}
      </motion.div>

      {/* Query Display */}
      <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
        <div className="px-4 py-2 bg-slate-800 font-bold text-white text-sm flex items-center gap-2">
          <Code className="w-4 h-4" />
          SQL Query
        </div>
        <div className="p-4 font-mono text-sm space-y-1">
          <div className="text-blue-400">{info.mainQuery}</div>
          <motion.div 
            animate={{ 
              backgroundColor: showExecution && executionStep >= 1 
                ? 'rgba(168, 85, 247, 0.2)' 
                : 'transparent' 
            }}
            className="pl-2 border-l-2 border-purple-500 text-purple-400"
          >
            {info.subQuery}
          </motion.div>
          <div className="text-blue-400">);</div>
        </div>
      </div>

      {/* Source Data */}
      <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
        <div className="px-4 py-2 bg-slate-700 font-bold text-white text-sm">
          Employees Table
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Department</th>
                <th className="px-3 py-2 text-right">Salary</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <motion.tr 
                  key={emp.id}
                  animate={{
                    backgroundColor: showExecution && executionStep >= 3 && results.mainResult.some(r => r.id === emp.id)
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'transparent'
                  }}
                  className="border-b border-slate-800 last:border-b-0"
                >
                  <td className="px-3 py-2">{emp.id}</td>
                  <td className="px-3 py-2">{emp.name}</td>
                  <td className="px-3 py-2">{emp.department}</td>
                  <td className="px-3 py-2 text-right font-mono">${emp.salary.toLocaleString()}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Execution Steps */}
      <AnimatePresence>
        {showExecution && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Step 1: Subquery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: executionStep >= 1 ? 1 : 0.3, x: 0 }}
              className={cn(
                "p-3 rounded-lg border flex items-start gap-3",
                executionStep >= 1 ? "border-purple-500 bg-purple-500/10" : "border-slate-700"
              )}
            >
              <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <div className="font-bold text-purple-400">Execute Subquery</div>
                <div className="text-sm text-slate-300 mt-1">
                  Result: <code className="px-1 bg-slate-800 rounded">{results.subResult}</code>
                </div>
              </div>
            </motion.div>

            {/* Step 2: Apply to Main */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: executionStep >= 2 ? 1 : 0.3, x: 0 }}
              transition={{ delay: 0.1 }}
              className={cn(
                "p-3 rounded-lg border flex items-start gap-3",
                executionStep >= 2 ? "border-blue-500 bg-blue-500/10" : "border-slate-700"
              )}
            >
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <div className="font-bold text-blue-400">Apply to Main Query</div>
                <div className="text-sm text-slate-300 mt-1">
                  Subquery result is plugged into the outer WHERE clause
                </div>
              </div>
            </motion.div>

            {/* Step 3: Final Result */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: executionStep >= 3 ? 1 : 0.3, x: 0 }}
              transition={{ delay: 0.2 }}
              className={cn(
                "p-3 rounded-lg border flex items-start gap-3",
                executionStep >= 3 ? "border-green-500 bg-green-500/10" : "border-slate-700"
              )}
            >
              <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <div className="font-bold text-green-400">Final Result</div>
                <div className="text-sm text-slate-300 mt-1">
                  {selectedType === 'table' 
                    ? `${results.subResult.split('\n').length} department averages returned`
                    : `${results.mainResult.length} row(s) match the condition`
                  }
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Beginner Tips */}
      {mode === 'beginner' && (
        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <h4 className="font-bold text-white mb-2">🎯 Key Concept</h4>
          <p className="text-sm text-slate-300">
            A subquery is a query inside another query. The <strong>inner query runs first</strong>, 
            and its result is used by the <strong>outer query</strong>. Think of it like solving 
            parentheses in math - you work from the inside out!
          </p>
        </div>
      )}
    </div>
  );
}

export default SubqueryPlayground;
