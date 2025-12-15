'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitMerge, Circle, ArrowRight, Play, RotateCcw, Eye, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface JoinVisualizerProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
}

type JoinType = 'inner' | 'left' | 'right' | 'full' | 'cross' | 'self';

interface Person {
  id: number;
  name: string;
  department_id: number | null;
}

interface Department {
  id: number;
  name: string;
}

const employees: Person[] = [
  { id: 1, name: 'Alice', department_id: 10 },
  { id: 2, name: 'Bob', department_id: 20 },
  { id: 3, name: 'Charlie', department_id: 10 },
  { id: 4, name: 'Diana', department_id: null },
];

const departments: Department[] = [
  { id: 10, name: 'Engineering' },
  { id: 20, name: 'Marketing' },
  { id: 30, name: 'Sales' },
];

const joinInfo: Record<JoinType, { 
  title: string; 
  description: string; 
  analogy: string;
  sql: string;
  color: string 
}> = {
  inner: {
    title: 'INNER JOIN',
    description: 'Returns only rows where there is a match in BOTH tables.',
    analogy: 'Like finding friends who are in BOTH your contact list AND your social media.',
    sql: 'SELECT * FROM Employees e\nINNER JOIN Departments d\nON e.department_id = d.id',
    color: 'from-green-500 to-green-600',
  },
  left: {
    title: 'LEFT JOIN',
    description: 'Returns ALL rows from the left table, plus matching rows from the right.',
    analogy: 'Like listing all employees, whether they have a department or not.',
    sql: 'SELECT * FROM Employees e\nLEFT JOIN Departments d\nON e.department_id = d.id',
    color: 'from-blue-500 to-blue-600',
  },
  right: {
    title: 'RIGHT JOIN',
    description: 'Returns ALL rows from the right table, plus matching rows from the left.',
    analogy: 'Like listing all departments, whether they have employees or not.',
    sql: 'SELECT * FROM Employees e\nRIGHT JOIN Departments d\nON e.department_id = d.id',
    color: 'from-purple-500 to-purple-600',
  },
  full: {
    title: 'FULL OUTER JOIN',
    description: 'Returns ALL rows from BOTH tables, matching where possible.',
    analogy: 'Like merging two lists - everyone from both, matched or not.',
    sql: 'SELECT * FROM Employees e\nFULL OUTER JOIN Departments d\nON e.department_id = d.id',
    color: 'from-orange-500 to-orange-600',
  },
  cross: {
    title: 'CROSS JOIN',
    description: 'Returns the Cartesian product - every row from left paired with every row from right.',
    analogy: 'Like pairing every employee with every department. 4 employees × 3 departments = 12 combinations!',
    sql: 'SELECT * FROM Employees e\nCROSS JOIN Departments d',
    color: 'from-red-500 to-red-600',
  },
  self: {
    title: 'SELF JOIN',
    description: 'Joins a table with itself - useful for hierarchical or comparison data.',
    analogy: 'Like comparing each employee with every other employee in the same table.',
    sql: 'SELECT a.name, b.name\nFROM Employees a\nJOIN Employees b\nON a.department_id = b.department_id\nWHERE a.id < b.id',
    color: 'from-pink-500 to-pink-600',
  },
};

function getJoinResults(joinType: JoinType) {
  switch (joinType) {
    case 'inner':
      return employees
        .filter(e => e.department_id !== null && departments.some(d => d.id === e.department_id))
        .map(e => ({
          employee: e.name,
          emp_dept_id: e.department_id,
          department: departments.find(d => d.id === e.department_id)?.name || null,
          matched: true,
        }));
    case 'left':
      return employees.map(e => ({
        employee: e.name,
        emp_dept_id: e.department_id,
        department: departments.find(d => d.id === e.department_id)?.name || null,
        matched: e.department_id !== null && departments.some(d => d.id === e.department_id),
      }));
    case 'right':
      const rightResults: { employee: string | null; emp_dept_id: number | null; department: string; matched: boolean }[] = [];
      departments.forEach(d => {
        const matchingEmployees = employees.filter(e => e.department_id === d.id);
        if (matchingEmployees.length > 0) {
          matchingEmployees.forEach(e => {
            rightResults.push({
              employee: e.name,
              emp_dept_id: e.department_id,
              department: d.name,
              matched: true,
            });
          });
        } else {
          rightResults.push({
            employee: null,
            emp_dept_id: null,
            department: d.name,
            matched: false,
          });
        }
      });
      return rightResults;
    case 'full':
      const fullResults: { employee: string | null; emp_dept_id: number | null; department: string | null; matched: boolean }[] = [];
      employees.forEach(e => {
        fullResults.push({
          employee: e.name,
          emp_dept_id: e.department_id,
          department: departments.find(d => d.id === e.department_id)?.name || null,
          matched: e.department_id !== null && departments.some(d => d.id === e.department_id),
        });
      });
      departments.forEach(d => {
        if (!employees.some(e => e.department_id === d.id)) {
          fullResults.push({
            employee: null,
            emp_dept_id: null,
            department: d.name,
            matched: false,
          });
        }
      });
      return fullResults;
    case 'cross':
      return employees.flatMap(e =>
        departments.map(d => ({
          employee: e.name,
          emp_dept_id: e.department_id,
          department: d.name,
          matched: true,
        }))
      );
    case 'self':
      const selfResults: { employee1: string; employee2: string; matched: boolean }[] = [];
      for (let i = 0; i < employees.length; i++) {
        for (let j = i + 1; j < employees.length; j++) {
          if (employees[i].department_id === employees[j].department_id && employees[i].department_id !== null) {
            selfResults.push({
              employee1: employees[i].name,
              employee2: employees[j].name,
              matched: true,
            });
          }
        }
      }
      return selfResults;
    default:
      return [];
  }
}

export function JoinVisualizer({ mode = 'beginner' }: JoinVisualizerProps) {
  const [selectedJoin, setSelectedJoin] = useState<JoinType>('inner');
  const [showResults, setShowResults] = useState(false);
  const [animating, setAnimating] = useState(false);

  const runJoin = useCallback(() => {
    setAnimating(true);
    setShowResults(false);
    setTimeout(() => {
      setShowResults(true);
      setAnimating(false);
    }, 800);
  }, []);

  const reset = useCallback(() => {
    setShowResults(false);
    setAnimating(false);
  }, []);

  const results = getJoinResults(selectedJoin);
  const info = joinInfo[selectedJoin];

  return (
    <div className="space-y-6 p-4 bg-slate-950 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <GitMerge className="w-5 h-5 text-blue-400" />
          SQL JOIN Visualizer
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={runJoin} disabled={animating}>
            <Play className="w-4 h-4 mr-1" />
            Run JOIN
          </Button>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* JOIN Type Selector */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(joinInfo) as JoinType[]).map((type) => (
          <Button
            key={type}
            variant={selectedJoin === type ? "default" : "outline"}
            size="sm"
            onClick={() => { setSelectedJoin(type); reset(); }}
            className={cn(
              "transition-all",
              selectedJoin === type && `bg-gradient-to-r ${joinInfo[type].color} border-0`
            )}
          >
            {joinInfo[type].title}
          </Button>
        ))}
      </div>

      {/* Join Info */}
      <motion.div
        key={selectedJoin}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("p-4 rounded-lg bg-gradient-to-r text-white", info.color)}
      >
        <div className="flex items-start gap-3">
          <Database className="w-6 h-6 mt-1" />
          <div>
            <h4 className="font-bold">{info.title}</h4>
            <p className="text-sm mt-1 opacity-90">{info.description}</p>
            {mode === 'beginner' && (
              <p className="text-sm mt-2 opacity-80">
                <strong>💡 Think of it like:</strong> {info.analogy}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* SQL Query */}
      {mode !== 'beginner' && (
        <div className="p-3 bg-slate-900 rounded-lg font-mono text-sm text-green-400">
          <pre>{info.sql}</pre>
        </div>
      )}

      {/* Source Tables */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Employees Table */}
        <motion.div 
          animate={{ 
            scale: animating ? [1, 1.02, 1] : 1,
            borderColor: animating ? ['rgb(71, 85, 105)', 'rgb(59, 130, 246)', 'rgb(71, 85, 105)'] : 'rgb(71, 85, 105)'
          }}
          transition={{ duration: 0.8 }}
          className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700"
        >
          <div className="px-4 py-2 bg-blue-600 font-bold text-white">Employees (Left)</div>
          <div className="grid grid-cols-3 gap-0 border-b border-slate-700 text-sm font-semibold">
            <div className="px-3 py-2 border-r border-slate-700">id</div>
            <div className="px-3 py-2 border-r border-slate-700">name</div>
            <div className="px-3 py-2">department_id</div>
          </div>
          {employees.map((emp) => (
            <div key={emp.id} className="grid grid-cols-3 gap-0 border-b border-slate-800 last:border-b-0 text-sm">
              <div className="px-3 py-2 border-r border-slate-800">{emp.id}</div>
              <div className="px-3 py-2 border-r border-slate-800">{emp.name}</div>
              <div className={cn(
                "px-3 py-2",
                emp.department_id === null && "text-slate-500 italic"
              )}>
                {emp.department_id ?? 'NULL'}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Departments Table */}
        <motion.div 
          animate={{ 
            scale: animating ? [1, 1.02, 1] : 1,
            borderColor: animating ? ['rgb(71, 85, 105)', 'rgb(168, 85, 247)', 'rgb(71, 85, 105)'] : 'rgb(71, 85, 105)'
          }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700"
        >
          <div className="px-4 py-2 bg-purple-600 font-bold text-white">Departments (Right)</div>
          <div className="grid grid-cols-2 gap-0 border-b border-slate-700 text-sm font-semibold">
            <div className="px-3 py-2 border-r border-slate-700">id</div>
            <div className="px-3 py-2">name</div>
          </div>
          {departments.map((dept) => (
            <div key={dept.id} className="grid grid-cols-2 gap-0 border-b border-slate-800 last:border-b-0 text-sm">
              <div className="px-3 py-2 border-r border-slate-800">{dept.id}</div>
              <div className="px-3 py-2">{dept.name}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-900 rounded-lg overflow-hidden border border-green-500/50"
          >
            <div className="px-4 py-2 bg-green-600 font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Result: {results.length} row(s)
            </div>
            
            {selectedJoin === 'self' ? (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-2 gap-0 border-b border-slate-700 text-sm font-semibold min-w-max">
                  <div className="px-3 py-2 border-r border-slate-700">Employee 1</div>
                  <div className="px-3 py-2">Employee 2</div>
                </div>
                {(results as { employee1: string; employee2: string; matched: boolean }[]).map((row, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="grid grid-cols-2 gap-0 border-b border-slate-800 last:border-b-0 text-sm"
                  >
                    <div className="px-3 py-2 border-r border-slate-800">{row.employee1}</div>
                    <div className="px-3 py-2">{row.employee2}</div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-3 gap-0 border-b border-slate-700 text-sm font-semibold min-w-max">
                  <div className="px-3 py-2 border-r border-slate-700">Employee</div>
                  <div className="px-3 py-2 border-r border-slate-700">Dept ID</div>
                  <div className="px-3 py-2">Department</div>
                </div>
                {(results as { employee: string | null; emp_dept_id: number | null; department: string | null; matched: boolean }[]).map((row, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      "grid grid-cols-3 gap-0 border-b border-slate-800 last:border-b-0 text-sm",
                      !row.matched && "bg-yellow-500/10"
                    )}
                  >
                    <div className={cn(
                      "px-3 py-2 border-r border-slate-800",
                      row.employee === null && "text-slate-500 italic"
                    )}>
                      {row.employee ?? 'NULL'}
                    </div>
                    <div className={cn(
                      "px-3 py-2 border-r border-slate-800",
                      row.emp_dept_id === null && "text-slate-500 italic"
                    )}>
                      {row.emp_dept_id ?? 'NULL'}
                    </div>
                    <div className={cn(
                      "px-3 py-2",
                      row.department === null && "text-slate-500 italic"
                    )}>
                      {row.department ?? 'NULL'}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Beginner Tips */}
      {mode === 'beginner' && (
        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <h4 className="font-bold text-white mb-2">🎯 Key Takeaways</h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• <strong>INNER JOIN</strong>: Only matching records from both tables</li>
            <li>• <strong>LEFT/RIGHT JOIN</strong>: All from one side, matches from the other</li>
            <li>• <strong>FULL JOIN</strong>: Everything from both tables</li>
            <li>• <strong>NULL</strong> values appear when there&apos;s no match</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default JoinVisualizer;
