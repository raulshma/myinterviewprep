'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Table, Key, ArrowRight, Grid, CheckCircle, XCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RdbmsConceptVisualizerProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
}

interface TableData {
  name: string;
  columns: { name: string; type: string; isPrimary?: boolean; isForeign?: boolean }[];
  rows: Record<string, string | number>[];
}

const sampleTables: TableData[] = [
  {
    name: 'Users',
    columns: [
      { name: 'id', type: 'INT', isPrimary: true },
      { name: 'name', type: 'VARCHAR(100)' },
      { name: 'email', type: 'VARCHAR(255)' },
      { name: 'age', type: 'INT' },
    ],
    rows: [
      { id: 1, name: 'Alice', email: 'alice@email.com', age: 28 },
      { id: 2, name: 'Bob', email: 'bob@email.com', age: 35 },
      { id: 3, name: 'Charlie', email: 'charlie@email.com', age: 22 },
    ],
  },
  {
    name: 'Orders',
    columns: [
      { name: 'order_id', type: 'INT', isPrimary: true },
      { name: 'user_id', type: 'INT', isForeign: true },
      { name: 'product', type: 'VARCHAR(100)' },
      { name: 'amount', type: 'DECIMAL' },
    ],
    rows: [
      { order_id: 101, user_id: 1, product: 'Laptop', amount: 999.99 },
      { order_id: 102, user_id: 1, product: 'Mouse', amount: 29.99 },
      { order_id: 103, user_id: 2, product: 'Keyboard', amount: 79.99 },
    ],
  },
];

const concepts = [
  {
    id: 'table',
    title: 'Table',
    icon: Table,
    analogy: 'Like a spreadsheet - rows and columns of organized data',
    description: 'A table stores data in a structured format with rows (records) and columns (fields).',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'row',
    title: 'Row (Record)',
    icon: Grid,
    analogy: 'Like a single entry in a contact list - all info about one item',
    description: 'Each row represents a single entry or record in the table.',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'column',
    title: 'Column (Field)',
    icon: ArrowRight,
    analogy: 'Like a category header - Name, Email, Age, etc.',
    description: 'Columns define the type of data stored, like names, emails, or ages.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'primary-key',
    title: 'Primary Key',
    icon: Key,
    analogy: 'Like a unique ID number - no two are the same',
    description: 'A unique identifier for each row. No duplicates allowed!',
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    id: 'foreign-key',
    title: 'Foreign Key',
    icon: Database,
    analogy: 'Like a reference to another table - linking related data',
    description: 'References a primary key in another table to establish relationships.',
    color: 'from-red-500 to-red-600',
  },
];

export function RdbmsConceptVisualizer({ mode = 'beginner' }: RdbmsConceptVisualizerProps) {
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);
  const [showRelationship, setShowRelationship] = useState(false);

  const handleConceptClick = useCallback((conceptId: string) => {
    setSelectedConcept(conceptId === selectedConcept ? null : conceptId);
    setHighlightedElement(conceptId);
  }, [selectedConcept]);

  const renderTable = (table: TableData, index: number) => (
    <motion.div
      key={table.name}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2 }}
      className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700"
    >
      {/* Table Header */}
      <div 
        className={cn(
          "px-4 py-2 font-bold text-white flex items-center gap-2 transition-all",
          highlightedElement === 'table' && "bg-gradient-to-r from-blue-500 to-blue-600"
        )}
      >
        <Table className="w-4 h-4" />
        {table.name}
      </div>
      
      {/* Column Headers */}
      <div className={cn(
        "grid gap-0 border-b border-slate-700",
        highlightedElement === 'column' && "bg-gradient-to-r from-purple-500/30 to-purple-600/30"
      )} style={{ gridTemplateColumns: `repeat(${table.columns.length}, 1fr)` }}>
        {table.columns.map((col) => (
          <div
            key={col.name}
            className={cn(
              "px-3 py-2 text-sm font-semibold border-r border-slate-700 last:border-r-0 flex items-center gap-1",
              col.isPrimary && highlightedElement === 'primary-key' && "bg-gradient-to-r from-yellow-500/30 to-yellow-600/30",
              col.isForeign && highlightedElement === 'foreign-key' && "bg-gradient-to-r from-red-500/30 to-red-600/30"
            )}
          >
            {col.isPrimary && <Key className="w-3 h-3 text-yellow-500" />}
            {col.isForeign && <Database className="w-3 h-3 text-red-500" />}
            <span>{col.name}</span>
            <span className="text-xs text-slate-500 ml-1">({col.type})</span>
          </div>
        ))}
      </div>
      
      {/* Rows */}
      {table.rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={cn(
            "grid gap-0 border-b border-slate-800 last:border-b-0 transition-all",
            highlightedElement === 'row' && rowIndex === 0 && "bg-gradient-to-r from-green-500/20 to-green-600/20"
          )}
          style={{ gridTemplateColumns: `repeat(${table.columns.length}, 1fr)` }}
        >
          {table.columns.map((col) => (
            <div
              key={col.name}
              className={cn(
                "px-3 py-2 text-sm border-r border-slate-800 last:border-r-0",
                col.isPrimary && "text-yellow-400 font-mono",
                col.isForeign && showRelationship && "text-red-400 font-mono"
              )}
            >
              {String(row[col.name])}
            </div>
          ))}
        </div>
      ))}
    </motion.div>
  );

  return (
    <div className="space-y-6 p-4 bg-slate-950 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-400" />
          RDBMS Concept Explorer
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRelationship(!showRelationship)}
            className={cn(showRelationship && "bg-red-500/20 border-red-500")}
          >
            {showRelationship ? 'Hide' : 'Show'} Relationships
          </Button>
        </div>
      </div>

      {/* Concept Buttons */}
      <div className="flex flex-wrap gap-2">
        {concepts.map((concept) => (
          <Button
            key={concept.id}
            variant={selectedConcept === concept.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleConceptClick(concept.id)}
            className={cn(
              "gap-2 transition-all",
              selectedConcept === concept.id && `bg-gradient-to-r ${concept.color} border-0`
            )}
          >
            <concept.icon className="w-4 h-4" />
            {concept.title}
          </Button>
        ))}
      </div>

      {/* Selected Concept Info */}
      <AnimatePresence>
        {selectedConcept && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {concepts.filter(c => c.id === selectedConcept).map((concept) => (
              <div key={concept.id} className={cn(
                "p-4 rounded-lg bg-gradient-to-r text-white",
                concept.color
              )}>
                <div className="flex items-start gap-3">
                  <concept.icon className="w-6 h-6 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg">{concept.title}</h4>
                    {mode === 'beginner' && (
                      <p className="text-sm opacity-90 mt-1">
                        <strong>Think of it like:</strong> {concept.analogy}
                      </p>
                    )}
                    <p className="text-sm mt-2">{concept.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Tables */}
      <div className="grid md:grid-cols-2 gap-4">
        {sampleTables.map((table, index) => renderTable(table, index))}
      </div>

      {/* Relationship Indicator */}
      {showRelationship && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-lg bg-red-500/10 border border-red-500/30"
        >
          <div className="flex items-center gap-2 text-red-400">
            <Info className="w-5 h-5" />
            <span className="font-semibold">Relationship Detected!</span>
          </div>
          <p className="text-sm text-slate-300 mt-2">
            The <code className="px-1 bg-slate-800 rounded">user_id</code> in Orders references the <code className="px-1 bg-slate-800 rounded">id</code> in Users.
            This is a <strong>foreign key relationship</strong> that links orders to their customers.
          </p>
        </motion.div>
      )}

      {/* Quick Quiz for Beginner Mode */}
      {mode === 'beginner' && (
        <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-slate-700">
          <h4 className="font-bold text-white mb-3">Quick Check ✓</h4>
          <p className="text-sm text-slate-300">
            Click on each concept above to learn what it means. In a relational database:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-400">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Tables organize data into rows and columns
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Primary keys uniquely identify each row
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Foreign keys create relationships between tables
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default RdbmsConceptVisualizer;
