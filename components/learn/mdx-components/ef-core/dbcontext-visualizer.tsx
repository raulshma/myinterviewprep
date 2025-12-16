'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  Server, 
  FileCode, 
  ArrowRight, 
  ArrowLeft,
  ChefHat,
  ClipboardList,
  UtensilsCrossed,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AnimatedControls,
  type AnimationSpeed,
  speedMultipliers,
} from '@/components/learn/shared/animated-controls';

interface DbContextVisualizerProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * DbContextVisualizer Component
 * Animated visualization showing DbContext as a "waiter" between app and database
 * Uses restaurant analogy to explain ORM concepts
 * Validates: Requirements 4.4
 */
export function DbContextVisualizer({ mode = 'beginner' }: DbContextVisualizerProps) {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<AnimationSpeed>('normal');
  const multiplier = speedMultipliers[speed];

  const steps = mode === 'beginner' ? beginnerSteps : advancedSteps;

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 3500 * multiplier);

    return () => clearInterval(interval);
  }, [isPlaying, multiplier, steps.length]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleSpeedChange = useCallback((newSpeed: AnimationSpeed) => {
    setSpeed(newSpeed);
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setStep(0);
    setTimeout(() => setIsPlaying(true), 100);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6 rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-secondary/30 border-b border-border flex items-center gap-2">
        <Database className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">
          DbContext: The Bridge Between Your App and Database
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          {mode === 'beginner' ? 'Restaurant Analogy' : 'Technical View'}
        </span>
      </div>

      {/* Visualization */}
      <div className="relative p-6 min-h-[320px]">
        {mode === 'beginner' ? (
          <BeginnerVisualization step={step} isPlaying={isPlaying} multiplier={multiplier} />
        ) : (
          <AdvancedVisualization step={step} isPlaying={isPlaying} multiplier={multiplier} />
        )}
      </div>

      {/* Step explanation */}
      <div className="px-4 py-3 border-t border-border bg-secondary/30">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-primary">
                Step {step + 1} of {steps.length}
              </span>
              <span className="text-xs text-muted-foreground">
                — {steps[step].title}
              </span>
            </div>
            <p className="text-sm text-foreground">{steps[step].description}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <AnimatedControls
        isPlaying={isPlaying}
        speed={speed}
        onPlayPause={handlePlayPause}
        onSpeedChange={handleSpeedChange}
        onReset={handleReset}
        label="DbContext workflow"
      />
    </motion.div>
  );
}


const beginnerSteps = [
  {
    title: 'Your Application (The Customer)',
    description: 'Your C# code wants to work with data. Just like a customer at a restaurant wants food, your app wants to read and write data.',
  },
  {
    title: 'DbContext (The Waiter)',
    description: 'DbContext is like a waiter who takes your order. It knows the menu (your data models) and communicates with the kitchen (database).',
  },
  {
    title: 'DbSet (Menu Sections)',
    description: 'Each DbSet is like a section of the menu. DbSet<Customer> is the "Customers" section, DbSet<Order> is the "Orders" section.',
  },
  {
    title: 'Making a Request',
    description: 'When you write LINQ queries, you\'re placing an order. The waiter (DbContext) translates your request into something the kitchen understands.',
  },
  {
    title: 'SaveChanges (Sending the Order)',
    description: 'When you call SaveChanges(), the waiter takes all your orders to the kitchen at once. The database processes them and confirms completion.',
  },
];

const advancedSteps = [
  {
    title: 'DbContext Instance',
    description: 'DbContext manages the connection to the database, tracks entity changes, and coordinates queries and updates.',
  },
  {
    title: 'Change Tracker',
    description: 'The Change Tracker monitors all entities loaded into the context, detecting Added, Modified, Deleted, and Unchanged states.',
  },
  {
    title: 'Query Pipeline',
    description: 'LINQ queries are translated to SQL through the query pipeline. EF Core optimizes and parameterizes queries automatically.',
  },
  {
    title: 'Unit of Work',
    description: 'DbContext implements the Unit of Work pattern, batching all changes and committing them in a single transaction.',
  },
  {
    title: 'Connection Management',
    description: 'EF Core manages database connections efficiently, opening them only when needed and pooling them for reuse.',
  },
];

function BeginnerVisualization({ 
  step, 
  isPlaying, 
  multiplier 
}: { 
  step: number; 
  isPlaying: boolean; 
  multiplier: number;
}) {
  return (
    <div className="flex items-center justify-between h-full gap-4">
      {/* Application (Customer) */}
      <div className="flex flex-col items-center gap-2">
        <motion.div
          className={cn(
            'p-4 rounded-xl border-2 transition-colors',
            step === 0 || step === 3
              ? 'bg-primary/20 border-primary'
              : 'bg-secondary/30 border-border'
          )}
          animate={step === 0 ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <FileCode className="w-10 h-10 text-primary" />
        </motion.div>
        <span className="text-xs font-medium text-foreground">Your App</span>
        <span className="text-xs text-muted-foreground">(Customer)</span>
      </div>

      {/* Arrow to DbContext */}
      <motion.div
        className="flex-shrink-0"
        animate={step === 3 ? { x: [0, 10, 0] } : {}}
        transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
      >
        <ArrowRight className={cn(
          'w-6 h-6 transition-colors',
          step === 3 || step === 4 ? 'text-primary' : 'text-muted-foreground/50'
        )} />
      </motion.div>

      {/* DbContext (Waiter) */}
      <div className="flex flex-col items-center gap-2">
        <motion.div
          className={cn(
            'p-4 rounded-xl border-2 transition-colors relative',
            step === 1 || step === 2 || step === 4
              ? 'bg-blue-500/20 border-blue-500'
              : 'bg-secondary/30 border-border'
          )}
          animate={step === 1 ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <ChefHat className="w-10 h-10 text-blue-500" />
          
          {/* DbSet indicators */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2"
            >
              <div className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-xs font-mono">
                DbSet&lt;Customer&gt;
              </div>
              <div className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-xs font-mono">
                DbSet&lt;Order&gt;
              </div>
            </motion.div>
          )}
        </motion.div>
        <span className="text-xs font-medium text-foreground">DbContext</span>
        <span className="text-xs text-muted-foreground">(Waiter)</span>
      </div>

      {/* Arrow to Database */}
      <motion.div
        className="flex-shrink-0"
        animate={step === 4 ? { x: [0, 10, 0] } : {}}
        transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
      >
        <ArrowRight className={cn(
          'w-6 h-6 transition-colors',
          step === 4 ? 'text-green-500' : 'text-muted-foreground/50'
        )} />
      </motion.div>

      {/* Database (Kitchen) */}
      <div className="flex flex-col items-center gap-2">
        <motion.div
          className={cn(
            'p-4 rounded-xl border-2 transition-colors',
            step === 4
              ? 'bg-green-500/20 border-green-500'
              : 'bg-secondary/30 border-border'
          )}
          animate={step === 4 ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Database className="w-10 h-10 text-green-500" />
        </motion.div>
        <span className="text-xs font-medium text-foreground">Database</span>
        <span className="text-xs text-muted-foreground">(Kitchen)</span>
      </div>

      {/* Animated order/data packet */}
      {isPlaying && (step === 3 || step === 4) && (
        <motion.div
          className="absolute top-1/2 -translate-y-1/2"
          initial={{ left: '15%', opacity: 0 }}
          animate={{ 
            left: step === 3 ? ['15%', '45%'] : ['45%', '75%'],
            opacity: [0, 1, 1, 0]
          }}
          transition={{ duration: 1.5 * multiplier, ease: 'easeInOut' }}
        >
          <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
            <ClipboardList className="w-4 h-4 text-primary" />
          </div>
        </motion.div>
      )}
    </div>
  );
}

function AdvancedVisualization({ 
  step, 
  isPlaying, 
  multiplier 
}: { 
  step: number; 
  isPlaying: boolean; 
  multiplier: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      {/* Application Layer */}
      <div className="p-4 rounded-xl border border-border bg-secondary/30">
        <div className="flex items-center gap-2 mb-3">
          <FileCode className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground text-sm">Application</h4>
        </div>
        <div className="space-y-2 text-xs">
          <div className={cn(
            'p-2 rounded border transition-colors',
            step === 2 ? 'bg-primary/10 border-primary/30' : 'bg-card border-border'
          )}>
            <code className="text-muted-foreground">
              context.Customers<br />
              &nbsp;&nbsp;.Where(c =&gt; c.Active)<br />
              &nbsp;&nbsp;.ToList();
            </code>
          </div>
        </div>
      </div>

      {/* DbContext Layer */}
      <div className={cn(
        'p-4 rounded-xl border-2 transition-colors',
        step === 0 || step === 1 || step === 3
          ? 'bg-blue-500/10 border-blue-500/50'
          : 'bg-secondary/30 border-border'
      )}>
        <div className="flex items-center gap-2 mb-3">
          <Server className="w-5 h-5 text-blue-500" />
          <h4 className="font-semibold text-foreground text-sm">DbContext</h4>
        </div>
        <div className="space-y-2 text-xs">
          <motion.div
            className={cn(
              'p-2 rounded border transition-colors',
              step === 1 ? 'bg-blue-500/10 border-blue-500/30' : 'bg-card border-border'
            )}
            animate={step === 1 ? { scale: [1, 1.02, 1] } : {}}
          >
            <span className="text-muted-foreground">Change Tracker</span>
          </motion.div>
          <motion.div
            className={cn(
              'p-2 rounded border transition-colors',
              step === 2 ? 'bg-blue-500/10 border-blue-500/30' : 'bg-card border-border'
            )}
            animate={step === 2 ? { scale: [1, 1.02, 1] } : {}}
          >
            <span className="text-muted-foreground">Query Pipeline</span>
          </motion.div>
          <motion.div
            className={cn(
              'p-2 rounded border transition-colors',
              step === 3 ? 'bg-blue-500/10 border-blue-500/30' : 'bg-card border-border'
            )}
            animate={step === 3 ? { scale: [1, 1.02, 1] } : {}}
          >
            <span className="text-muted-foreground">Unit of Work</span>
          </motion.div>
        </div>
      </div>

      {/* Database Layer */}
      <div className={cn(
        'p-4 rounded-xl border transition-colors',
        step === 4 ? 'bg-green-500/10 border-green-500/50' : 'bg-secondary/30 border-border'
      )}>
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-5 h-5 text-green-500" />
          <h4 className="font-semibold text-foreground text-sm">Database</h4>
        </div>
        <div className="space-y-2 text-xs">
          <div className={cn(
            'p-2 rounded border transition-colors',
            step === 4 ? 'bg-green-500/10 border-green-500/30' : 'bg-card border-border'
          )}>
            <code className="text-muted-foreground">
              SELECT * FROM Customers<br />
              WHERE Active = 1
            </code>
          </div>
          <motion.div
            className={cn(
              'p-2 rounded border transition-colors',
              step === 4 ? 'bg-green-500/10 border-green-500/30' : 'bg-card border-border'
            )}
            animate={step === 4 && isPlaying ? { opacity: [0.5, 1, 0.5] } : {}}
            transition={{ duration: 1 * multiplier, repeat: Infinity }}
          >
            <span className="text-muted-foreground">Connection Pool</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default DbContextVisualizer;
