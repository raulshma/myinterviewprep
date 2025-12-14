'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  Play, 
  RotateCcw, 
  Search, 
  Plus, 
  Edit3, 
  Trash2,
  ArrowRight,
  CheckCircle,
  Table2,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type QueryType = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';

export interface TableRow {
  id: number;
  [key: string]: string | number | boolean;
}

export interface SqlQueryVisualizerProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
  title?: string;
  queryType?: QueryType;
  tableName?: string;
  initialData?: TableRow[];
  columns?: string[];
}

const defaultData: TableRow[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@email.com', age: 28, active: true },
  { id: 2, name: 'Bob Smith', email: 'bob@email.com', age: 34, active: true },
  { id: 3, name: 'Charlie Brown', email: 'charlie@email.com', age: 22, active: false },
  { id: 4, name: 'Diana Prince', email: 'diana@email.com', age: 30, active: true },
];

const queryAnalogies: Record<QueryType, { title: string; emoji: string; description: string }> = {
  SELECT: {
    title: 'Reading from a Library',
    emoji: '📚',
    description: 'SELECT is like asking a librarian to find specific books. You describe what you want, and the database retrieves matching records without changing anything.',
  },
  INSERT: {
    title: 'Adding to a Collection',
    emoji: '➕',
    description: 'INSERT is like adding a new card to a filing cabinet. You specify the drawer (table) and provide all the information for the new card.',
  },
  UPDATE: {
    title: 'Editing a Document',
    emoji: '✏️',
    description: 'UPDATE is like using an eraser and pencil on a form. You find the specific entries and change their values while keeping them in place.',
  },
  DELETE: {
    title: 'Removing Records',
    emoji: '🗑️',
    description: 'DELETE is like removing cards from a filing cabinet. Be careful - once removed, the data is gone (unless you have backups)!',
  },
};

export function SqlQueryVisualizer({
  mode = 'beginner',
  title = 'SQL Query Visualizer',
  queryType: initialQueryType = 'SELECT',
  tableName = 'Users',
  initialData = defaultData,
  columns = ['id', 'name', 'email', 'age', 'active'],
}: SqlQueryVisualizerProps) {
  const [data, setData] = useState<TableRow[]>(initialData);
  const [queryType, setQueryType] = useState<QueryType>(initialQueryType);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [highlightedRows, setHighlightedRows] = useState<number[]>([]);
  const [filterColumn, setFilterColumn] = useState('name');
  const [filterValue, setFilterValue] = useState('');
  const [lastResult, setLastResult] = useState<string>('');
  const [showResult, setShowResult] = useState(false);

  const queryIcons: Record<QueryType, React.ReactNode> = useMemo(() => ({
    SELECT: <Search className="h-4 w-4" />,
    INSERT: <Plus className="h-4 w-4" />,
    UPDATE: <Edit3 className="h-4 w-4" />,
    DELETE: <Trash2 className="h-4 w-4" />,
  }), []);

  const queryColors: Record<QueryType, string> = {
    SELECT: 'bg-blue-600 hover:bg-blue-700 border-blue-500',
    INSERT: 'bg-green-600 hover:bg-green-700 border-green-500',
    UPDATE: 'bg-yellow-600 hover:bg-yellow-700 border-yellow-500',
    DELETE: 'bg-red-600 hover:bg-red-700 border-red-500',
  };

  const generateQuery = useCallback((): string => {
    switch (queryType) {
      case 'SELECT':
        if (filterValue) {
          return `SELECT * FROM ${tableName}\nWHERE ${filterColumn} LIKE '%${filterValue}%';`;
        }
        return `SELECT * FROM ${tableName};`;
      case 'INSERT':
        return `INSERT INTO ${tableName} (name, email, age, active)\nVALUES ('New User', 'new@email.com', 25, true);`;
      case 'UPDATE':
        return `UPDATE ${tableName}\nSET active = false\nWHERE id IN (${selectedRows.length > 0 ? selectedRows.join(', ') : '...'});`;
      case 'DELETE':
        return `DELETE FROM ${tableName}\nWHERE id IN (${selectedRows.length > 0 ? selectedRows.join(', ') : '...'});`;
      default:
        return '';
    }
  }, [queryType, tableName, filterColumn, filterValue, selectedRows]);

  const executeQuery = useCallback(async () => {
    setIsExecuting(true);
    setShowResult(false);
    
    // Animate query execution
    await new Promise(resolve => setTimeout(resolve, 800));
    
    switch (queryType) {
      case 'SELECT': {
        const filtered = filterValue 
          ? data.filter(row => 
              String(row[filterColumn]).toLowerCase().includes(filterValue.toLowerCase())
            )
          : data;
        setHighlightedRows(filtered.map(r => r.id));
        setLastResult(`${filtered.length} row(s) returned`);
        break;
      }
      case 'INSERT': {
        const newId = Math.max(...data.map(d => d.id), 0) + 1;
        const newRow: TableRow = {
          id: newId,
          name: `New User ${newId}`,
          email: `user${newId}@email.com`,
          age: 25,
          active: true,
        };
        setData(prev => [...prev, newRow]);
        setHighlightedRows([newId]);
        setLastResult(`1 row inserted (ID: ${newId})`);
        break;
      }
      case 'UPDATE': {
        if (selectedRows.length > 0) {
          setData(prev => prev.map(row => 
            selectedRows.includes(row.id) ? { ...row, active: false } : row
          ));
          setHighlightedRows(selectedRows);
          setLastResult(`${selectedRows.length} row(s) updated`);
        }
        break;
      }
      case 'DELETE': {
        if (selectedRows.length > 0) {
          setData(prev => prev.filter(row => !selectedRows.includes(row.id)));
          setLastResult(`${selectedRows.length} row(s) deleted`);
          setSelectedRows([]);
          setHighlightedRows([]);
        }
        break;
      }
    }
    
    setIsExecuting(false);
    setShowResult(true);
    
    // Clear highlights after delay
    setTimeout(() => setHighlightedRows([]), 2000);
  }, [queryType, data, filterColumn, filterValue, selectedRows]);

  const toggleRowSelection = useCallback((id: number) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
    setSelectedRows([]);
    setHighlightedRows([]);
    setFilterValue('');
    setShowResult(false);
    setLastResult('');
  }, [initialData]);

  const analogy = queryAnalogies[queryType];

  return (
    <Card className="my-4 overflow-hidden bg-gray-950 border-gray-800">
      <CardHeader className="pb-2 flex flex-row items-center justify-between bg-gray-900/50">
        <CardTitle className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <Database className="h-4 w-4 text-cyan-400" />
          {title}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={reset} className="text-gray-400 hover:text-white">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Beginner Analogy */}
        {mode === 'beginner' && (
          <motion.div 
            key={queryType}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cyan-900/20 border border-cyan-700 rounded-lg p-4"
          >
            <h4 className="font-medium text-cyan-300 mb-2">
              {analogy.emoji} {analogy.title}
            </h4>
            <p className="text-sm text-gray-400">{analogy.description}</p>
          </motion.div>
        )}

        {/* Query Type Selector */}
        <div className="flex flex-wrap gap-2">
          {(['SELECT', 'INSERT', 'UPDATE', 'DELETE'] as QueryType[]).map(type => (
            <Button
              key={type}
              size="sm"
              variant={queryType === type ? 'default' : 'outline'}
              className={cn(
                'flex items-center gap-1 transition-all',
                queryType === type && queryColors[type]
              )}
              onClick={() => {
                setQueryType(type);
                setSelectedRows([]);
                setHighlightedRows([]);
                setShowResult(false);
              }}
            >
              {queryIcons[type]}
              {type}
            </Button>
          ))}
        </div>

        {/* Query Builder / Filter */}
        {queryType === 'SELECT' && (
          <div className="flex items-center gap-2 p-3 bg-gray-900 rounded-lg border border-gray-700">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterColumn}
              onChange={(e) => setFilterColumn(e.target.value)}
              className="bg-gray-800 text-gray-300 text-sm rounded px-2 py-1 border border-gray-600"
            >
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
            <span className="text-gray-500 text-sm">LIKE</span>
            <input
              type="text"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              placeholder="Filter value..."
              className="flex-1 bg-gray-800 text-gray-200 text-sm rounded px-2 py-1 border border-gray-600"
            />
          </div>
        )}

        {/* Row Selection Info for UPDATE/DELETE */}
        {(queryType === 'UPDATE' || queryType === 'DELETE') && (
          <div className="text-sm text-gray-400 bg-gray-900 p-2 rounded">
            Click rows below to select them for {queryType.toLowerCase()}. 
            Selected: <span className="text-cyan-400">{selectedRows.length} row(s)</span>
          </div>
        )}

        {/* SQL Query Preview */}
        <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-gray-800/50 border-b border-gray-700">
            <span className="text-xs font-mono text-gray-400">SQL Query</span>
            <Button
              size="sm"
              onClick={executeQuery}
              disabled={isExecuting || ((queryType === 'UPDATE' || queryType === 'DELETE') && selectedRows.length === 0)}
              className={cn('h-7', queryColors[queryType])}
            >
              {isExecuting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Play className="h-3 w-3" />
                </motion.div>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Execute
                </>
              )}
            </Button>
          </div>
          <pre className="p-3 text-sm font-mono text-cyan-400 overflow-x-auto">
            {generateQuery()}
          </pre>
        </div>

        {/* Data Direction Arrow */}
        <div className="flex justify-center">
          <motion.div
            animate={isExecuting ? { x: [0, 10, 0] } : {}}
            transition={{ duration: 0.5, repeat: isExecuting ? Infinity : 0 }}
          >
            <ArrowRight className={cn('h-6 w-6', isExecuting ? 'text-cyan-400' : 'text-gray-600')} />
          </motion.div>
        </div>

        {/* Data Table */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border-b border-gray-700">
            <Table2 className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-mono text-gray-300">{tableName}</span>
            <span className="text-xs text-gray-500 ml-auto">{data.length} rows</span>
          </div>
          <div className="overflow-x-auto max-h-60 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 sticky top-0">
                <tr>
                  {columns.map(col => (
                    <th 
                      key={col} 
                      className="text-left px-3 py-2 text-xs font-medium text-gray-400 border-b border-gray-700"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {data.map(row => (
                    <motion.tr
                      key={row.id}
                      layout
                      initial={{ opacity: 0, backgroundColor: 'rgba(34, 197, 94, 0.3)' }}
                      animate={{ 
                        opacity: 1, 
                        backgroundColor: highlightedRows.includes(row.id as number) 
                          ? 'rgba(34, 197, 94, 0.2)' 
                          : selectedRows.includes(row.id as number)
                            ? 'rgba(59, 130, 246, 0.2)'
                            : 'transparent'
                      }}
                      exit={{ opacity: 0, height: 0, backgroundColor: 'rgba(239, 68, 68, 0.3)' }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        'border-b border-gray-800 cursor-pointer transition-colors',
                        (queryType === 'UPDATE' || queryType === 'DELETE') && 'hover:bg-gray-800'
                      )}
                      onClick={() => (queryType === 'UPDATE' || queryType === 'DELETE') && toggleRowSelection(row.id as number)}
                    >
                      {columns.map(col => (
                        <td key={col} className="px-3 py-2 text-gray-300">
                          {typeof row[col] === 'boolean' ? (
                            <span className={row[col] ? 'text-green-400' : 'text-red-400'}>
                              {row[col] ? 'true' : 'false'}
                            </span>
                          ) : (
                            String(row[col])
                          )}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Result Message */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-700 rounded-lg"
            >
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-300">{lastResult}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced: Execution Plan Hint */}
        {mode === 'advanced' && queryType === 'SELECT' && (
          <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
            <h4 className="text-xs font-medium text-gray-400 mb-2">Execution Plan Insight</h4>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-yellow-400">
                {filterValue ? 'Index Scan (filtered)' : 'Table Scan (full)'}
              </span>
              <span className="text-gray-500">|</span>
              <span className="text-cyan-400">Est. Cost: {filterValue ? 'Low' : 'High'}</span>
              <span className="text-gray-500">|</span>
              <span className="text-green-400">Rows: {highlightedRows.length || data.length}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SqlQueryVisualizer;
