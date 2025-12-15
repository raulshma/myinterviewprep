'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Play, RotateCcw, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateTimeExplorerProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
}

type DateFunctionType = 'GETDATE' | 'DATEADD' | 'DATEDIFF' | 'DATEPART' | 'FORMAT' | 'YEAR' | 'MONTH' | 'DAY';

interface DateInterval {
  name: string;
  value: 'year' | 'month' | 'day' | 'hour' | 'minute';
  description: string;
}

const intervals: DateInterval[] = [
  { name: 'YEAR', value: 'year', description: 'Add/subtract years' },
  { name: 'MONTH', value: 'month', description: 'Add/subtract months' },
  { name: 'DAY', value: 'day', description: 'Add/subtract days' },
  { name: 'HOUR', value: 'hour', description: 'Add/subtract hours' },
  { name: 'MINUTE', value: 'minute', description: 'Add/subtract minutes' },
];

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDateTime(date: Date): string {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

function addToDate(date: Date, interval: string, amount: number): Date {
  const result = new Date(date);
  switch (interval) {
    case 'year':
      result.setFullYear(result.getFullYear() + amount);
      break;
    case 'month':
      result.setMonth(result.getMonth() + amount);
      break;
    case 'day':
      result.setDate(result.getDate() + amount);
      break;
    case 'hour':
      result.setHours(result.getHours() + amount);
      break;
    case 'minute':
      result.setMinutes(result.getMinutes() + amount);
      break;
  }
  return result;
}

function getDiff(date1: Date, date2: Date, interval: string): number {
  const diffMs = date2.getTime() - date1.getTime();
  switch (interval) {
    case 'year':
      return Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
    case 'month':
      return Math.floor(diffMs / (30.44 * 24 * 60 * 60 * 1000));
    case 'day':
      return Math.floor(diffMs / (24 * 60 * 60 * 1000));
    case 'hour':
      return Math.floor(diffMs / (60 * 60 * 1000));
    case 'minute':
      return Math.floor(diffMs / (60 * 1000));
    default:
      return 0;
  }
}

function TimelineVisualizer({ 
  startDate, 
  endDate, 
  interval,
  amount 
}: { 
  startDate: Date; 
  endDate: Date; 
  interval: string;
  amount: number;
}) {
  const isForward = amount >= 0;
  
  return (
    <div className="relative h-32 mt-6 mb-4 px-4">
      {/* Timeline */}
      <div className="absolute left-8 right-8 top-16 h-1 bg-gradient-to-r from-blue-500 via-slate-600 to-emerald-500 rounded-full" />
      
      {/* Start marker */}
      <motion.div
        className="absolute left-8 top-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col items-center">
          <span className="text-xs text-blue-400 font-medium mb-1">Start</span>
          <div className="w-4 h-4 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
          <div className="w-0.5 h-4 bg-blue-500" />
          <span className="text-xs text-slate-400 mt-1">{formatDate(startDate)}</span>
        </div>
      </motion.div>
      
      {/* End marker */}
      <motion.div
        className="absolute right-8 top-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex flex-col items-center">
          <span className="text-xs text-emerald-400 font-medium mb-1">Result</span>
          <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
          <div className="w-0.5 h-4 bg-emerald-500" />
          <span className="text-xs text-slate-400 mt-1">{formatDate(endDate)}</span>
        </div>
      </motion.div>
      
      {/* Arrow with amount */}
      <motion.div
        className="absolute left-1/2 top-12 -translate-x-1/2"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className={cn(
          'flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
          isForward ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
        )}>
          {isForward ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
          <span>{Math.abs(amount)} {interval}{Math.abs(amount) !== 1 ? 's' : ''}</span>
        </div>
      </motion.div>
    </div>
  );
}

export function DateTimeExplorer({ mode = 'beginner' }: DateTimeExplorerProps) {
  const [selectedFunction, setSelectedFunction] = useState<'DATEADD' | 'DATEDIFF' | 'DATEPART'>('DATEADD');
  const [inputDate, setInputDate] = useState<string>(formatDate(new Date()));
  const [secondDate, setSecondDate] = useState<string>(formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)));
  const [selectedInterval, setSelectedInterval] = useState<string>('day');
  const [amount, setAmount] = useState<number>(7);
  const [showResult, setShowResult] = useState(false);

  const startDate = useMemo(() => new Date(inputDate), [inputDate]);
  const endDateInput = useMemo(() => new Date(secondDate), [secondDate]);
  
  const result = useMemo(() => {
    if (selectedFunction === 'DATEADD') {
      return addToDate(startDate, selectedInterval, amount);
    } else if (selectedFunction === 'DATEDIFF') {
      return getDiff(startDate, endDateInput, selectedInterval);
    } else {
      // DATEPART
      switch (selectedInterval) {
        case 'year': return startDate.getFullYear();
        case 'month': return startDate.getMonth() + 1;
        case 'day': return startDate.getDate();
        case 'hour': return startDate.getHours();
        case 'minute': return startDate.getMinutes();
        default: return 0;
      }
    }
  }, [selectedFunction, startDate, endDateInput, selectedInterval, amount]);

  const handleCalculate = () => {
    setShowResult(true);
  };

  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-amber-500/20">
          <Calendar className="h-5 w-5 text-amber-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Date & Time Explorer</h3>
      </div>

      {/* Function Selection */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['DATEADD', 'DATEDIFF', 'DATEPART'] as const).map((func) => (
          <button
            key={func}
            onClick={() => {
              setSelectedFunction(func);
              setShowResult(false);
            }}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              selectedFunction === func
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            )}
          >
            {func}
          </button>
        ))}
      </div>

      {/* Function Description */}
      <motion.div
        key={selectedFunction}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 mb-6"
      >
        <p className="text-white font-medium">
          {selectedFunction === 'DATEADD' && 'Add or subtract a time interval from a date'}
          {selectedFunction === 'DATEDIFF' && 'Calculate the difference between two dates'}
          {selectedFunction === 'DATEPART' && 'Extract a specific part from a date'}
        </p>
        {mode === 'beginner' && (
          <p className="text-slate-400 text-sm mt-1">
            {selectedFunction === 'DATEADD' && '💡 Like setting a reminder: "7 days from now"'}
            {selectedFunction === 'DATEDIFF' && '💡 Like counting days until your birthday'}
            {selectedFunction === 'DATEPART' && '💡 Like reading just the month from a calendar'}
          </p>
        )}
      </motion.div>

      {/* Input Controls */}
      <div className="grid gap-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              {selectedFunction === 'DATEDIFF' ? 'Start Date' : 'Date'}
            </label>
            <input
              type="date"
              value={inputDate}
              onChange={(e) => {
                setInputDate(e.target.value);
                setShowResult(false);
              }}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {selectedFunction === 'DATEDIFF' && (
            <div>
              <label className="block text-sm text-slate-400 mb-1">End Date</label>
              <input
                type="date"
                value={secondDate}
                onChange={(e) => {
                  setSecondDate(e.target.value);
                  setShowResult(false);
                }}
                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Interval</label>
            <select
              value={selectedInterval}
              onChange={(e) => {
                setSelectedInterval(e.target.value);
                setShowResult(false);
              }}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {intervals.map((int) => (
                <option key={int.value} value={int.value}>
                  {int.name}
                </option>
              ))}
            </select>
          </div>

          {selectedFunction === 'DATEADD' && (
            <div>
              <label className="block text-sm text-slate-400 mb-1">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(parseInt(e.target.value) || 0);
                  setShowResult(false);
                }}
                className="w-24 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}
        </div>

        <button
          onClick={handleCalculate}
          className="w-fit flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors"
        >
          <Play className="h-4 w-4" />
          Calculate
        </button>
      </div>

      {/* Timeline Visualization (for DATEADD) */}
      {showResult && selectedFunction === 'DATEADD' && (
        <TimelineVisualizer 
          startDate={startDate} 
          endDate={result as Date} 
          interval={selectedInterval}
          amount={amount}
        />
      )}

      {/* Result Display */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <code className="text-lg text-slate-300">
              {selectedFunction}({selectedInterval.toUpperCase()}, 
              {selectedFunction === 'DATEADD' && ` ${amount},`}
              {selectedFunction === 'DATEDIFF' && ` '${inputDate}',`}
              {selectedFunction === 'DATEDIFF' && ` '${secondDate}'`}
              {selectedFunction !== 'DATEDIFF' && ` '${inputDate}'`}
              )
            </code>
            <ArrowRight className="h-5 w-5 text-slate-500" />
            <span className="text-2xl font-bold text-amber-400">
              {result instanceof Date ? formatDate(result) : result}
            </span>
          </div>
          
          {mode !== 'beginner' && (
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <p className="text-sm text-slate-400">
                <span className="text-slate-300 font-medium">SQL Server: </span>
                <code className="text-amber-400">
                  SELECT {selectedFunction}({selectedInterval}, 
                  {selectedFunction === 'DATEADD' ? ` ${amount}, '${inputDate}'` : ''}
                  {selectedFunction === 'DATEDIFF' ? ` '${inputDate}', '${secondDate}'` : ''}
                  {selectedFunction === 'DATEPART' ? ` '${inputDate}'` : ''}
                  );
                </code>
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Advanced Mode: Database Variations */}
      {mode === 'advanced' && (
        <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <h4 className="text-amber-400 font-medium mb-2">⚠️ Database Variations</h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• MySQL: DATE_ADD(), TIMESTAMPDIFF(), EXTRACT()</li>
            <li>• PostgreSQL: date + interval, AGE(), DATE_PART()</li>
            <li>• SQL Server: DATEADD(), DATEDIFF(), DATEPART()</li>
            <li>• Oracle: ADD_MONTHS(), MONTHS_BETWEEN(), EXTRACT()</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default DateTimeExplorer;
