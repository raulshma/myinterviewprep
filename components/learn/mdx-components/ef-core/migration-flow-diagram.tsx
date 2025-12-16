'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileCode, 
  FileText, 
  Database,
  ArrowRight,
  Terminal,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AnimatedControls,
  type AnimationSpeed,
  speedMultipliers,
} from '@/components/learn/shared/animated-controls';

interface MigrationStep {
  title: string;
  description: string;
  command?: string;
  icon: 'model' | 'migration' | 'database' | 'terminal';
}

const migrationSteps: MigrationStep[] = [
  {
    title: 'Model Changes',
    description: 'You modify your C# entity classes or DbContext configuration',
    icon: 'model',
  },
  {
    title: 'Add Migration',
    description: 'EF Core compares your model to the last migration snapshot',
    command: 'dotnet ef migrations add AddCustomerEmail',
    icon: 'terminal',
  },
  {
    title: 'Migration File',
    description: 'A new migration file is generated with Up() and Down() methods',
    icon: 'migration',
  },
  {
    title: 'Update Database',
    description: 'Apply the migration to update your database schema',
    command: 'dotnet ef database update',
    icon: 'terminal',
  },
  {
    title: 'Database Updated',
    description: 'Your database schema now matches your C# model',
    icon: 'database',
  },
];

/**
 * MigrationFlowDiagram Component
 * Animated flow diagram showing the EF Core migration workflow
 * Validates: Requirements 9.4
 */
export function MigrationFlowDiagram() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<AnimationSpeed>('normal');
  const multiplier = speedMultipliers[speed];

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % migrationSteps.length);
    }, 3000 * multiplier);

    return () => clearInterval(interval);
  }, [isPlaying, multiplier]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleSpeedChange = useCallback((newSpeed: AnimationSpeed) => {
    setSpeed(newSpeed);
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
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
          EF Core Migration Workflow
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          Code First Approach
        </span>
      </div>

      {/* Flow Diagram */}
      <div className="p-6">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4">
          {migrationSteps.map((step, i) => (
            <FlowStep
              key={i}
              step={step}
              index={i}
              isActive={i === currentStep}
              isCompleted={i < currentStep}
              isLast={i === migrationSteps.length - 1}
              multiplier={multiplier}
            />
          ))}
        </div>
      </div>

      {/* Current Step Details */}
      <div className="px-4 py-4 border-t border-border bg-secondary/30">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-primary">
                Step {currentStep + 1}:
              </span>
              <span className="text-sm font-medium text-foreground">
                {migrationSteps[currentStep].title}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {migrationSteps[currentStep].description}
            </p>
            {migrationSteps[currentStep].command && (
              <div className="bg-zinc-900 rounded-lg p-3 font-mono text-sm">
                <span className="text-green-400">$ </span>
                <span className="text-zinc-300">{migrationSteps[currentStep].command}</span>
              </div>
            )}
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
        label="Migration workflow"
      />
    </motion.div>
  );
}


interface FlowStepProps {
  step: MigrationStep;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  isLast: boolean;
  multiplier: number;
}

function FlowStep({ step, index, isActive, isCompleted, isLast, multiplier }: FlowStepProps) {
  return (
    <>
      <motion.div
        className={cn(
          'flex flex-col items-center gap-2 min-w-[80px]',
        )}
        animate={isActive ? { scale: 1.05 } : { scale: 1 }}
      >
        {/* Icon Circle */}
        <motion.div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors',
            isActive && 'bg-primary/20 border-primary',
            isCompleted && 'bg-green-500/20 border-green-500',
            !isActive && !isCompleted && 'bg-secondary/30 border-border'
          )}
          animate={isActive ? { 
            boxShadow: ['0 0 0 0 rgba(var(--primary), 0)', '0 0 0 8px rgba(var(--primary), 0.2)', '0 0 0 0 rgba(var(--primary), 0)']
          } : {}}
          transition={{ duration: 1.5 * multiplier, repeat: isActive ? Infinity : 0 }}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          ) : (
            <StepIcon 
              icon={step.icon} 
              className={cn(
                'w-6 h-6',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )} 
            />
          )}
        </motion.div>

        {/* Step Number */}
        <span className={cn(
          'text-xs font-medium',
          isActive ? 'text-primary' : isCompleted ? 'text-green-500' : 'text-muted-foreground'
        )}>
          {index + 1}
        </span>
      </motion.div>

      {/* Arrow */}
      {!isLast && (
        <div className="flex-shrink-0 flex items-center">
          <motion.div
            className="relative w-8 h-0.5 bg-border"
            animate={isCompleted ? { backgroundColor: 'rgb(34, 197, 94)' } : {}}
          >
            {/* Animated dot */}
            {isActive && (
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary"
                animate={{ left: ['0%', '100%'] }}
                transition={{ duration: 1 * multiplier, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </motion.div>
          <ArrowRight className={cn(
            'w-4 h-4 -ml-1',
            isCompleted ? 'text-green-500' : 'text-muted-foreground'
          )} />
        </div>
      )}
    </>
  );
}

function StepIcon({ icon, className }: { icon: MigrationStep['icon']; className?: string }) {
  switch (icon) {
    case 'model':
      return <FileCode className={className} />;
    case 'migration':
      return <FileText className={className} />;
    case 'database':
      return <Database className={className} />;
    case 'terminal':
      return <Terminal className={className} />;
    default:
      return <Circle className={className} />;
  }
}

export default MigrationFlowDiagram;
