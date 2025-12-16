'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Save, 
  RotateCcw,
  Circle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MinusCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EntityState = 'Added' | 'Modified' | 'Deleted' | 'Unchanged' | 'Detached';

interface Entity {
  id: number;
  name: string;
  state: EntityState;
  originalName?: string;
}

/**
 * ChangeTrackingVisualizer Component
 * Interactive demo showing EF Core entity state management
 * Validates: Requirements 9.1
 */
export function ChangeTrackingVisualizer() {
  const [entities, setEntities] = useState<Entity[]>([
    { id: 1, name: 'Alice', state: 'Unchanged' },
    { id: 2, name: 'Bob', state: 'Unchanged' },
  ]);
  const [nextId, setNextId] = useState(3);
  const [lastAction, setLastAction] = useState<string>('');
  const [pendingChanges, setPendingChanges] = useState(0);

  const addEntity = useCallback(() => {
    const newEntity: Entity = {
      id: nextId,
      name: `Entity ${nextId}`,
      state: 'Added',
    };
    setEntities((prev) => [...prev, newEntity]);
    setNextId((prev) => prev + 1);
    setPendingChanges((prev) => prev + 1);
    setLastAction(`context.Customers.Add(new Customer { Name = "Entity ${nextId}" });`);
  }, [nextId]);

  const modifyEntity = useCallback((id: number) => {
    setEntities((prev) =>
      prev.map((e) => {
        if (e.id === id && e.state !== 'Added' && e.state !== 'Deleted') {
          setPendingChanges((p) => e.state === 'Unchanged' ? p + 1 : p);
          return {
            ...e,
            name: `${e.name} (edited)`,
            state: 'Modified' as EntityState,
            originalName: e.originalName || e.name,
          };
        }
        return e;
      })
    );
    setLastAction(`customer.Name = "..." // Entity state changes to Modified`);
  }, []);

  const deleteEntity = useCallback((id: number) => {
    setEntities((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          if (e.state === 'Added') {
            // Remove immediately if it was just added
            setPendingChanges((p) => p - 1);
            return { ...e, state: 'Detached' as EntityState };
          }
          setPendingChanges((p) => e.state === 'Deleted' ? p : p + 1);
          return { ...e, state: 'Deleted' as EntityState };
        }
        return e;
      }).filter((e) => e.state !== 'Detached')
    );
    setLastAction(`context.Customers.Remove(customer); // State changes to Deleted`);
  }, []);

  const saveChanges = useCallback(() => {
    setEntities((prev) =>
      prev
        .filter((e) => e.state !== 'Deleted')
        .map((e) => ({
          ...e,
          state: 'Unchanged' as EntityState,
          originalName: undefined,
        }))
    );
    setPendingChanges(0);
    setLastAction(`await context.SaveChangesAsync(); // All changes committed to database`);
  }, []);

  const reset = useCallback(() => {
    setEntities([
      { id: 1, name: 'Alice', state: 'Unchanged' },
      { id: 2, name: 'Bob', state: 'Unchanged' },
    ]);
    setNextId(3);
    setPendingChanges(0);
    setLastAction('');
  }, []);

  const visibleEntities = entities.filter((e) => e.state !== 'Detached');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6 rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-secondary/30 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Circle className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            EF Core Change Tracking
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Pending changes: 
          </span>
          <span className={cn(
            'text-xs font-mono px-2 py-0.5 rounded',
            pendingChanges > 0 
              ? 'bg-yellow-500/20 text-yellow-500' 
              : 'bg-green-500/20 text-green-500'
          )}>
            {pendingChanges}
          </span>
        </div>
      </div>

      {/* Entity List */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-foreground">Tracked Entities</h4>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={addEntity}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
            <Button 
              size="sm" 
              onClick={saveChanges}
              disabled={pendingChanges === 0}
            >
              <Save className="w-4 h-4 mr-1" />
              SaveChanges()
            </Button>
            <Button size="sm" variant="outline" onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {visibleEntities.map((entity) => (
            <EntityCard
              key={entity.id}
              entity={entity}
              onModify={() => modifyEntity(entity.id)}
              onDelete={() => deleteEntity(entity.id)}
            />
          ))}
        </AnimatePresence>

        {visibleEntities.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No entities tracked. Click &quot;Add&quot; to create one.
          </div>
        )}
      </div>

      {/* State Legend */}
      <div className="px-4 py-3 border-t border-border bg-secondary/20">
        <div className="flex flex-wrap gap-4 text-xs">
          <StateLegendItem state="Unchanged" />
          <StateLegendItem state="Added" />
          <StateLegendItem state="Modified" />
          <StateLegendItem state="Deleted" />
        </div>
      </div>

      {/* Last Action */}
      {lastAction && (
        <div className="px-4 py-3 border-t border-border bg-zinc-900">
          <code className="text-xs text-green-400 font-mono">{lastAction}</code>
        </div>
      )}
    </motion.div>
  );
}


interface EntityCardProps {
  entity: Entity;
  onModify: () => void;
  onDelete: () => void;
}

function EntityCard({ entity, onModify, onDelete }: EntityCardProps) {
  const stateConfig = getStateConfig(entity.state);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, x: -20 }}
      className={cn(
        'p-3 rounded-lg border flex items-center justify-between gap-3 transition-colors',
        stateConfig.bgClass,
        stateConfig.borderClass
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <stateConfig.icon className={cn('w-5 h-5 shrink-0', stateConfig.iconClass)} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-sm font-medium',
              entity.state === 'Deleted' && 'line-through text-muted-foreground'
            )}>
              {entity.name}
            </span>
            <span className="text-xs text-muted-foreground">
              (ID: {entity.id})
            </span>
          </div>
          {entity.originalName && entity.state === 'Modified' && (
            <span className="text-xs text-muted-foreground">
              Original: {entity.originalName}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className={cn(
          'text-xs font-mono px-2 py-0.5 rounded',
          stateConfig.badgeClass
        )}>
          {entity.state}
        </span>
        
        {entity.state !== 'Deleted' && (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={onModify}
              disabled={entity.state === 'Added'}
              className="h-7 w-7 p-0"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}

function StateLegendItem({ state }: { state: EntityState }) {
  const config = getStateConfig(state);
  
  return (
    <div className="flex items-center gap-1.5">
      <config.icon className={cn('w-3.5 h-3.5', config.iconClass)} />
      <span className="text-muted-foreground">{state}</span>
    </div>
  );
}

function getStateConfig(state: EntityState) {
  switch (state) {
    case 'Added':
      return {
        icon: Plus,
        iconClass: 'text-green-500',
        bgClass: 'bg-green-500/10',
        borderClass: 'border-green-500/30',
        badgeClass: 'bg-green-500/20 text-green-500',
      };
    case 'Modified':
      return {
        icon: AlertCircle,
        iconClass: 'text-yellow-500',
        bgClass: 'bg-yellow-500/10',
        borderClass: 'border-yellow-500/30',
        badgeClass: 'bg-yellow-500/20 text-yellow-500',
      };
    case 'Deleted':
      return {
        icon: XCircle,
        iconClass: 'text-red-500',
        bgClass: 'bg-red-500/10',
        borderClass: 'border-red-500/30',
        badgeClass: 'bg-red-500/20 text-red-500',
      };
    case 'Unchanged':
      return {
        icon: CheckCircle2,
        iconClass: 'text-blue-500',
        bgClass: 'bg-secondary/30',
        borderClass: 'border-border',
        badgeClass: 'bg-blue-500/20 text-blue-500',
      };
    case 'Detached':
    default:
      return {
        icon: MinusCircle,
        iconClass: 'text-muted-foreground',
        bgClass: 'bg-secondary/30',
        borderClass: 'border-border',
        badgeClass: 'bg-secondary text-muted-foreground',
      };
  }
}

export default ChangeTrackingVisualizer;
