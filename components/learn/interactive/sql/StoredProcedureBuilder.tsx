'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Play, Plus, Trash2, Settings, ArrowRight, Variable } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StoredProcedureBuilderProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
}

interface Parameter {
  name: string;
  type: string;
  direction: 'IN' | 'OUT' | 'INOUT';
  defaultValue?: string;
}

const dataTypes = ['INT', 'VARCHAR(50)', 'VARCHAR(255)', 'DECIMAL(10,2)', 'DATE', 'DATETIME', 'BIT'];

export function StoredProcedureBuilder({ mode = 'beginner' }: StoredProcedureBuilderProps) {
  const [procName, setProcName] = useState('usp_GetEmployeesByDept');
  const [parameters, setParameters] = useState<Parameter[]>([
    { name: '@DepartmentID', type: 'INT', direction: 'IN' },
  ]);
  const [bodyCode, setBodyCode] = useState('SELECT * FROM Employees\nWHERE DepartmentID = @DepartmentID;');
  const [showSQL, setShowSQL] = useState(false);

  const addParameter = () => {
    setParameters(prev => [
      ...prev,
      { name: `@Param${prev.length + 1}`, type: 'INT', direction: 'IN' },
    ]);
  };

  const removeParameter = (index: number) => {
    setParameters(prev => prev.filter((_, i) => i !== index));
  };

  const updateParameter = (index: number, field: keyof Parameter, value: string) => {
    setParameters(prev => prev.map((p, i) => 
      i === index ? { ...p, [field]: value } : p
    ));
  };

  const generateSQL = () => {
    const paramList = parameters.map(p => {
      let param = `${p.name} ${p.type}`;
      if (mode !== 'beginner' && p.direction === 'OUT') param += ' OUTPUT';
      if (p.defaultValue) param += ` = ${p.defaultValue}`;
      return param;
    }).join(',\n    ');

    return `CREATE PROCEDURE ${procName}
    ${paramList}
AS
BEGIN
    SET NOCOUNT ON;
    
    ${bodyCode}
END;`;
  };

  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-violet-500/20">
          <Code className="h-5 w-5 text-violet-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Stored Procedure Builder</h3>
      </div>

      {/* Beginner Explanation */}
      {mode === 'beginner' && (
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 mb-6">
          <p className="text-white font-medium">What is a Stored Procedure?</p>
          <p className="text-slate-400 text-sm mt-1">
            💡 Think of it as a saved recipe in your database. Instead of writing the same SQL 
            over and over, you save it once and call it by name - like ordering &quot;my usual&quot; at 
            your favorite restaurant!
          </p>
        </div>
      )}

      {/* Procedure Name */}
      <div className="mb-6">
        <label className="block text-sm text-slate-400 mb-1">Procedure Name</label>
        <input
          type="text"
          value={procName}
          onChange={(e) => setProcName(e.target.value)}
          className="w-full max-w-md px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
          placeholder="usp_ProcedureName"
        />
        <p className="text-xs text-slate-500 mt-1">Convention: usp_ prefix for user stored procedures</p>
      </div>

      {/* Parameters */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-slate-400">Parameters</label>
          <button
            onClick={addParameter}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add Parameter
          </button>
        </div>
        
        <div className="space-y-2">
          {parameters.map((param, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-wrap gap-2 items-center p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
            >
              <Variable className="h-4 w-4 text-slate-500" />
              
              <input
                type="text"
                value={param.name}
                onChange={(e) => updateParameter(idx, 'name', e.target.value)}
                className="w-32 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                placeholder="@ParamName"
              />
              
              <select
                value={param.type}
                onChange={(e) => updateParameter(idx, 'type', e.target.value)}
                className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                {dataTypes.map(dt => (
                  <option key={dt} value={dt}>{dt}</option>
                ))}
              </select>
              
              {mode !== 'beginner' && (
                <select
                  value={param.direction}
                  onChange={(e) => updateParameter(idx, 'direction', e.target.value as 'IN' | 'OUT' | 'INOUT')}
                  className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="IN">IN</option>
                  <option value="OUT">OUT</option>
                  <option value="INOUT">INOUT</option>
                </select>
              )}
              
              <button
                onClick={() => removeParameter(idx)}
                className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
          
          {parameters.length === 0 && (
            <p className="text-sm text-slate-500 italic">No parameters defined</p>
          )}
        </div>
      </div>

      {/* Procedure Body */}
      <div className="mb-6">
        <label className="block text-sm text-slate-400 mb-1">Procedure Body</label>
        <textarea
          value={bodyCode}
          onChange={(e) => setBodyCode(e.target.value)}
          rows={5}
          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y"
          placeholder="-- Your SQL code here"
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={() => setShowSQL(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500 text-white font-medium hover:bg-violet-600 transition-colors"
      >
        <Play className="h-4 w-4" />
        Generate CREATE PROCEDURE
      </button>

      {/* SQL Output */}
      {showSQL && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-lg bg-slate-900 border border-slate-700"
        >
          <pre className="text-sm text-violet-400 font-mono whitespace-pre-wrap overflow-x-auto">
            {generateSQL()}
          </pre>
        </motion.div>
      )}

      {/* Execution Example */}
      {showSQL && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
        >
          <span className="text-xs text-slate-500 uppercase tracking-wider">Call the procedure</span>
          <code className="block mt-1 text-sm text-emerald-400 font-mono">
            EXEC {procName} {parameters.map(p => p.defaultValue || '1').join(', ')};
          </code>
        </motion.div>
      )}

      {/* Advanced: Best Practices */}
      {mode === 'advanced' && (
        <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <h4 className="text-amber-400 font-medium mb-2">Best Practices</h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• Use SET NOCOUNT ON to improve performance</li>
            <li>• Implement TRY/CATCH for error handling</li>
            <li>• Use transactions for multi-statement operations</li>
            <li>• Validate input parameters to prevent SQL injection</li>
            <li>• Consider WITH ENCRYPTION for sensitive logic</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default StoredProcedureBuilder;
