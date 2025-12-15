'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Lock, Unlock, Check, X, Key, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityPermissionDemoProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
}

type Permission = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'EXECUTE';

interface User {
  name: string;
  role: string;
  permissions: Permission[];
}

interface PermissionMatrix {
  [table: string]: {
    [permission: string]: boolean;
  };
}

const initialUsers: User[] = [
  { name: 'admin_user', role: 'db_owner', permissions: ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'EXECUTE'] },
  { name: 'analyst_user', role: 'data_reader', permissions: ['SELECT'] },
  { name: 'app_user', role: 'app_role', permissions: ['SELECT', 'INSERT', 'UPDATE'] },
];

const tables = ['Employees', 'Salaries', 'Departments', 'AuditLog'];
const permissions: Permission[] = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];

export function SecurityPermissionDemo({ mode = 'beginner' }: SecurityPermissionDemoProps) {
  const [selectedUser, setSelectedUser] = useState<User>(initialUsers[1]);
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>({
    Employees: { SELECT: true, INSERT: false, UPDATE: false, DELETE: false },
    Salaries: { SELECT: false, INSERT: false, UPDATE: false, DELETE: false },
    Departments: { SELECT: true, INSERT: false, UPDATE: false, DELETE: false },
    AuditLog: { SELECT: true, INSERT: false, UPDATE: false, DELETE: false },
  });
  const [sqlHistory, setSqlHistory] = useState<string[]>([]);
  const [testQuery, setTestQuery] = useState('SELECT * FROM Employees');
  const [testResult, setTestResult] = useState<'allowed' | 'denied' | null>(null);

  const togglePermission = (table: string, permission: Permission) => {
    const newMatrix = { ...permissionMatrix };
    newMatrix[table] = { ...newMatrix[table], [permission]: !newMatrix[table][permission] };
    setPermissionMatrix(newMatrix);
    
    const action = newMatrix[table][permission] ? 'GRANT' : 'REVOKE';
    const sql = `${action} ${permission} ON ${table} TO ${selectedUser.name};`;
    setSqlHistory(prev => [...prev.slice(-4), sql]);
  };

  const testAccess = () => {
    // Simple parsing
    const upperQuery = testQuery.toUpperCase();
    let operation: Permission = 'SELECT';
    let tableName = '';
    
    if (upperQuery.includes('SELECT')) operation = 'SELECT';
    else if (upperQuery.includes('INSERT')) operation = 'INSERT';
    else if (upperQuery.includes('UPDATE')) operation = 'UPDATE';
    else if (upperQuery.includes('DELETE')) operation = 'DELETE';
    
    // Find table name
    for (const t of tables) {
      if (upperQuery.includes(t.toUpperCase())) {
        tableName = t;
        break;
      }
    }
    
    if (tableName && permissionMatrix[tableName]) {
      setTestResult(permissionMatrix[tableName][operation] ? 'allowed' : 'denied');
    } else {
      setTestResult('denied');
    }
    
    setTimeout(() => setTestResult(null), 3000);
  };

  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-rose-500/20">
          <Shield className="h-5 w-5 text-rose-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Security & Permissions Demo</h3>
      </div>

      {/* Beginner Explanation */}
      {mode === 'beginner' && (
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 mb-6">
          <p className="text-white font-medium">Database Security Basics</p>
          <p className="text-slate-400 text-sm mt-1">
            💡 Think of it like keycards in a building. Different people have access to different rooms. 
            GRANT gives a keycard, REVOKE takes it away!
          </p>
        </div>
      )}

      {/* User Selection */}
      <div className="mb-6">
        <label className="block text-sm text-slate-400 mb-2">Select User</label>
        <div className="flex flex-wrap gap-2">
          {initialUsers.map((user) => (
            <button
              key={user.name}
              onClick={() => setSelectedUser(user)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                selectedUser.name === user.name
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              )}
            >
              <Users className="h-4 w-4" />
              {user.name}
              <span className="text-xs opacity-70">({user.role})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 px-3 text-slate-400 font-medium">Table</th>
              {permissions.map((p) => (
                <th key={p} className="text-center py-2 px-3 text-slate-400 font-medium">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tables.map((table) => (
              <tr key={table} className="border-b border-slate-700/50">
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-slate-500" />
                    <span className="text-white">{table}</span>
                  </div>
                </td>
                {permissions.map((perm) => {
                  const hasPermission = permissionMatrix[table]?.[perm];
                  return (
                    <td key={perm} className="text-center py-2 px-3">
                      <button
                        onClick={() => togglePermission(table, perm)}
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                          hasPermission
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                            : 'bg-slate-700/50 text-slate-500 border border-slate-600/50 hover:border-slate-500'
                        )}
                      >
                        {hasPermission ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SQL History */}
      {sqlHistory.length > 0 && (
        <div className="mb-6 p-3 rounded-lg bg-slate-900 border border-slate-700">
          <span className="text-xs text-slate-500 uppercase tracking-wider">Generated SQL</span>
          <div className="mt-2 space-y-1">
            {sqlHistory.map((sql, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm font-mono"
              >
                <span className={sql.startsWith('GRANT') ? 'text-emerald-400' : 'text-red-400'}>
                  {sql}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Test Access (Intermediate+) */}
      {mode !== 'beginner' && (
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <label className="block text-sm text-slate-400 mb-2">Test a Query as {selectedUser.name}</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="SELECT * FROM Employees"
            />
            <button
              onClick={testAccess}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500 text-white font-medium hover:bg-rose-600 transition-colors"
            >
              <Key className="h-4 w-4" />
              Test
            </button>
          </div>
          
          <AnimatePresence>
            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'mt-3 p-3 rounded-lg flex items-center gap-2',
                  testResult === 'allowed'
                    ? 'bg-emerald-500/20 border border-emerald-500/50'
                    : 'bg-red-500/20 border border-red-500/50'
                )}
              >
                {testResult === 'allowed' ? (
                  <>
                    <Unlock className="h-5 w-5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Access Allowed</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 text-red-400" />
                    <span className="text-red-400 font-medium">Access Denied - Permission Required</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Advanced: Security Concepts */}
      {mode === 'advanced' && (
        <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <h4 className="text-amber-400 font-medium mb-2">Advanced Security Concepts</h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• <strong>Row-Level Security (RLS):</strong> Filter rows based on user context</li>
            <li>• <strong>Dynamic Data Masking:</strong> Hide sensitive data from unauthorized users</li>
            <li>• <strong>Always Encrypted:</strong> Encrypt data at rest and in transit</li>
            <li>• <strong>Principle of Least Privilege:</strong> Grant minimum required permissions</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default SecurityPermissionDemo;
