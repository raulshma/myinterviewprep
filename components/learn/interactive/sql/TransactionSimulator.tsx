'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Lock, Unlock, CheckCircle, XCircle, RotateCcw, AlertTriangle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TransactionSimulatorProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
}

type TransactionState = 'idle' | 'active' | 'committed' | 'rolled-back';

interface AccountData {
  id: number;
  name: string;
  balance: number;
  locked?: boolean;
}

const initialAccounts: AccountData[] = [
  { id: 1, name: 'Alice', balance: 1000 },
  { id: 2, name: 'Bob', balance: 500 },
];

const acidProperties = [
  {
    letter: 'A',
    name: 'Atomicity',
    description: 'All or nothing - either all operations succeed, or none do.',
    analogy: 'Like a light switch - it\'s either fully on or fully off, never half-way.',
    color: 'bg-red-500',
  },
  {
    letter: 'C',
    name: 'Consistency',
    description: 'Database moves from one valid state to another valid state.',
    analogy: 'Like balancing a checkbook - the numbers must always add up correctly.',
    color: 'bg-yellow-500',
  },
  {
    letter: 'I',
    name: 'Isolation',
    description: 'Concurrent transactions don\'t interfere with each other.',
    analogy: 'Like separate bank tellers - each handles one customer at a time.',
    color: 'bg-green-500',
  },
  {
    letter: 'D',
    name: 'Durability',
    description: 'Once committed, changes survive system failures.',
    analogy: 'Like writing in permanent ink - once done, it stays done.',
    color: 'bg-blue-500',
  },
];

export function TransactionSimulator({ mode = 'beginner' }: TransactionSimulatorProps) {
  const [accounts, setAccounts] = useState<AccountData[]>(initialAccounts);
  const [pendingChanges, setPendingChanges] = useState<AccountData[]>([]);
  const [transactionState, setTransactionState] = useState<TransactionState>('idle');
  const [log, setLog] = useState<string[]>([]);
  const [transferAmount, setTransferAmount] = useState(200);
  const [selectedAcid, setSelectedAcid] = useState<string | null>(null);

  const addLog = useCallback((message: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  }, []);

  const beginTransaction = useCallback(() => {
    setTransactionState('active');
    setPendingChanges([...accounts.map(a => ({ ...a, locked: true }))]);
    addLog('BEGIN TRANSACTION');
    addLog('Acquiring locks on accounts...');
  }, [accounts, addLog]);

  const executeTransfer = useCallback(() => {
    if (transactionState !== 'active') return;
    
    const from = pendingChanges.find(a => a.id === 1);
    const to = pendingChanges.find(a => a.id === 2);
    
    if (!from || !to) return;
    
    if (from.balance < transferAmount) {
      addLog(`ERROR: Insufficient funds! Alice has $${from.balance}, needs $${transferAmount}`);
      return;
    }
    
    setPendingChanges(prev => prev.map(a => {
      if (a.id === 1) return { ...a, balance: a.balance - transferAmount };
      if (a.id === 2) return { ...a, balance: a.balance + transferAmount };
      return a;
    }));
    
    addLog(`UPDATE accounts SET balance = balance - ${transferAmount} WHERE id = 1`);
    addLog(`UPDATE accounts SET balance = balance + ${transferAmount} WHERE id = 2`);
  }, [transactionState, pendingChanges, transferAmount, addLog]);

  const commit = useCallback(() => {
    if (transactionState !== 'active') return;
    
    setAccounts(pendingChanges.map(a => ({ ...a, locked: false })));
    setTransactionState('committed');
    addLog('COMMIT');
    addLog('✓ Transaction committed successfully!');
    addLog('Locks released.');
  }, [transactionState, pendingChanges, addLog]);

  const rollback = useCallback(() => {
    if (transactionState !== 'active') return;
    
    setPendingChanges([]);
    setTransactionState('rolled-back');
    addLog('ROLLBACK');
    addLog('↩ All changes have been undone!');
    addLog('Locks released.');
  }, [transactionState, addLog]);

  const reset = useCallback(() => {
    setAccounts(initialAccounts);
    setPendingChanges([]);
    setTransactionState('idle');
    setLog([]);
  }, []);

  const displayData = transactionState === 'active' ? pendingChanges : accounts;
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const pendingTotal = pendingChanges.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="space-y-6 p-4 bg-slate-950 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-400" />
          Transaction Simulator
        </h3>
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-2 py-1 rounded text-xs font-bold",
            transactionState === 'idle' && "bg-slate-700 text-slate-300",
            transactionState === 'active' && "bg-yellow-500/20 text-yellow-400 animate-pulse",
            transactionState === 'committed' && "bg-green-500/20 text-green-400",
            transactionState === 'rolled-back' && "bg-red-500/20 text-red-400"
          )}>
            {transactionState.toUpperCase()}
          </span>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* ACID Properties */}
      <div className="grid grid-cols-4 gap-2">
        {acidProperties.map((prop) => (
          <button
            key={prop.letter}
            onClick={() => setSelectedAcid(selectedAcid === prop.letter ? null : prop.letter)}
            className={cn(
              "p-3 rounded-lg text-center transition-all hover:scale-105",
              selectedAcid === prop.letter ? prop.color : "bg-slate-800",
              "text-white"
            )}
          >
            <div className="text-2xl font-bold">{prop.letter}</div>
            <div className="text-xs opacity-80">{prop.name}</div>
          </button>
        ))}
      </div>

      {/* Selected ACID Info */}
      <AnimatePresence>
        {selectedAcid && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {acidProperties.filter(p => p.letter === selectedAcid).map(prop => (
              <div key={prop.letter} className={cn("p-4 rounded-lg text-white", prop.color)}>
                <h4 className="font-bold">{prop.name}</h4>
                <p className="text-sm mt-1">{prop.description}</p>
                {mode === 'beginner' && (
                  <p className="text-sm mt-2 opacity-80">
                    <strong>💡 Think of it like:</strong> {prop.analogy}
                  </p>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Account Tables */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Current State */}
        <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
          <div className="px-4 py-2 bg-slate-700 font-bold text-white flex items-center justify-between">
            <span>Accounts (Current)</span>
            <span className="text-sm text-green-400">Total: ${totalBalance}</span>
          </div>
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between px-4 py-3 border-b border-slate-800 last:border-b-0">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                <span>{account.name}</span>
              </div>
              <span className="font-mono font-bold text-green-400">${account.balance}</span>
            </div>
          ))}
        </div>

        {/* Pending Changes */}
        <div className={cn(
          "bg-slate-900 rounded-lg overflow-hidden border",
          transactionState === 'active' ? "border-yellow-500/50" : "border-slate-700"
        )}>
          <div className={cn(
            "px-4 py-2 font-bold text-white flex items-center justify-between",
            transactionState === 'active' ? "bg-yellow-600" : "bg-slate-700"
          )}>
            <span className="flex items-center gap-2">
              {transactionState === 'active' && <Lock className="w-4 h-4" />}
              Pending Changes
            </span>
            {pendingChanges.length > 0 && (
              <span className={cn(
                "text-sm",
                pendingTotal === totalBalance ? "text-green-400" : "text-red-400"
              )}>
                Total: ${pendingTotal}
              </span>
            )}
          </div>
          {transactionState === 'active' ? (
            pendingChanges.map((account) => (
              <motion.div 
                key={account.id} 
                initial={{ backgroundColor: 'transparent' }}
                animate={{ 
                  backgroundColor: account.balance !== accounts.find(a => a.id === account.id)?.balance 
                    ? 'rgba(234, 179, 8, 0.1)' 
                    : 'transparent' 
                }}
                className="flex items-center justify-between px-4 py-3 border-b border-slate-800 last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-yellow-400" />
                  <span>{account.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {account.balance !== accounts.find(a => a.id === account.id)?.balance && (
                    <span className="text-xs text-slate-500 line-through">
                      ${accounts.find(a => a.id === account.id)?.balance}
                    </span>
                  )}
                  <span className="font-mono font-bold text-yellow-400">${account.balance}</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-slate-500">
              {transactionState === 'idle' && "No active transaction"}
              {transactionState === 'committed' && (
                <span className="flex items-center justify-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  Committed to database!
                </span>
              )}
              {transactionState === 'rolled-back' && (
                <span className="flex items-center justify-center gap-2 text-red-400">
                  <XCircle className="w-5 h-5" />
                  Changes discarded
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-900 rounded-lg">
        <span className="text-sm text-slate-400">Transfer amount:</span>
        <input
          type="number"
          value={transferAmount}
          onChange={(e) => setTransferAmount(Number(e.target.value))}
          className="w-24 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white"
          min={1}
          max={2000}
        />
        <span className="text-sm text-slate-400">from Alice to Bob</span>
        
        <div className="flex-1" />
        
        <Button
          onClick={beginTransaction}
          disabled={transactionState === 'active'}
          variant="outline"
          size="sm"
        >
          BEGIN
        </Button>
        <Button
          onClick={executeTransfer}
          disabled={transactionState !== 'active'}
          variant="outline"
          size="sm"
        >
          Execute Transfer
        </Button>
        <Button
          onClick={commit}
          disabled={transactionState !== 'active'}
          className="bg-green-600 hover:bg-green-700"
          size="sm"
        >
          COMMIT
        </Button>
        <Button
          onClick={rollback}
          disabled={transactionState !== 'active'}
          className="bg-red-600 hover:bg-red-700"
          size="sm"
        >
          ROLLBACK
        </Button>
      </div>

      {/* Transaction Log */}
      {log.length > 0 && (
        <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
          <div className="px-4 py-2 bg-slate-800 font-bold text-white text-sm">
            Transaction Log
          </div>
          <div className="p-3 font-mono text-xs space-y-1 max-h-40 overflow-y-auto">
            {log.map((entry, idx) => (
              <div 
                key={idx} 
                className={cn(
                  entry.includes('ERROR') && "text-red-400",
                  entry.includes('✓') && "text-green-400",
                  entry.includes('↩') && "text-yellow-400",
                  !entry.includes('ERROR') && !entry.includes('✓') && !entry.includes('↩') && "text-slate-400"
                )}
              >
                {entry}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Beginner Tips */}
      {mode === 'beginner' && (
        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <h4 className="font-bold text-white mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            Why Transactions Matter
          </h4>
          <p className="text-sm text-slate-300">
            Imagine transferring money between accounts. Without transactions, if the system crashes after 
            deducting from Alice but before adding to Bob, the money would disappear! Transactions ensure 
            either <strong>both operations succeed (COMMIT)</strong> or <strong>both fail (ROLLBACK)</strong>.
          </p>
        </div>
      )}
    </div>
  );
}

export default TransactionSimulator;
