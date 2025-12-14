'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Layers, ArrowDown, ArrowUp, Plus, Edit2, Trash2, RotateCcw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface Entity {
  id: number;
  name: string;
  properties: Record<string, string>;
  state: 'unchanged' | 'added' | 'modified' | 'deleted';
}

export interface DbContextVisualizerProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
  title?: string;
  entityType?: string;
  initialEntities?: Entity[];
}

const defaultEntities: Entity[] = [
  { id: 1, name: 'Blog', properties: { Title: 'My First Blog', Url: 'blog.com' }, state: 'unchanged' },
  { id: 2, name: 'Blog', properties: { Title: 'Tech Tips', Url: 'tech.com' }, state: 'unchanged' },
];

export function DbContextVisualizer({
  mode = 'beginner',
  title = 'DbContext & DbSet Explorer',
  entityType = 'Blog',
  initialEntities = defaultEntities,
}: DbContextVisualizerProps) {
  const [entities, setEntities] = useState<Entity[]>(initialEntities);
  const [pendingChanges, setPendingChanges] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showDatabase, setShowDatabase] = useState(false);
  const [savedEntities, setSavedEntities] = useState<Entity[]>(initialEntities);

  const addEntity = useCallback(() => {
    const newId = Math.max(...entities.map(e => e.id), 0) + 1;
    const newEntity: Entity = {
      id: newId,
      name: entityType,
      properties: { Title: `New ${entityType} ${newId}`, Url: `new${newId}.com` },
      state: 'added',
    };
    setEntities(prev => [...prev, newEntity]);
    setPendingChanges(prev => [...prev, `ADD: ${entityType} (Id: ${newId})`]);
  }, [entities, entityType]);

  const modifyEntity = useCallback((id: number) => {
    setEntities(prev => prev.map(e => 
      e.id === id && e.state !== 'added' 
        ? { ...e, properties: { ...e.properties, Title: e.properties.Title + ' (edited)' }, state: 'modified' }
        : e
    ));
    setPendingChanges(prev => [...prev, `MODIFY: ${entityType} (Id: ${id})`]);
  }, [entityType]);

  const deleteEntity = useCallback((id: number) => {
    setEntities(prev => prev.map(e => 
      e.id === id ? { ...e, state: 'deleted' } : e
    ));
    setPendingChanges(prev => [...prev, `DELETE: ${entityType} (Id: ${id})`]);
  }, [entityType]);

  const saveChanges = useCallback(async () => {
    setIsSaving(true);
    setShowDatabase(true);
    
    // Animate saving
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Apply changes to "database"
    const newSaved = entities.filter(e => e.state !== 'deleted').map(e => ({ ...e, state: 'unchanged' as const }));
    setSavedEntities(newSaved);
    setEntities(newSaved);
    setPendingChanges([]);
    setIsSaving(false);
  }, [entities]);

  const reset = useCallback(() => {
    setEntities(initialEntities);
    setSavedEntities(initialEntities);
    setPendingChanges([]);
    setShowDatabase(false);
    setIsSaving(false);
  }, [initialEntities]);

  const stateColors = {
    unchanged: 'border-gray-600 bg-gray-800/50',
    added: 'border-green-500 bg-green-900/30',
    modified: 'border-yellow-500 bg-yellow-900/30',
    deleted: 'border-red-500 bg-red-900/30 opacity-60',
  };

  const stateLabels = {
    unchanged: '✓ Unchanged',
    added: '+ Added',
    modified: '~ Modified',
    deleted: '× Deleted',
  };

  return (
    <Card className="my-4 overflow-hidden bg-gray-950 border-gray-800">
      <CardHeader className="pb-2 flex flex-row items-center justify-between bg-gray-900/50">
        <CardTitle className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <Layers className="h-4 w-4 text-purple-400" />
          {title}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={reset} className="text-gray-400 hover:text-white">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Beginner Analogy */}
        {mode === 'beginner' && (
          <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
            <h4 className="font-medium text-purple-300 mb-2">🌉 DbContext is Like a Bridge</h4>
            <p className="text-sm text-gray-400">
              Think of <strong>DbContext</strong> as a bridge between your C# code and the database. 
              It keeps track of all your changes and only sends them to the database when you call 
              <code className="mx-1 px-1 bg-gray-800 rounded text-cyan-400">SaveChanges()</code>.
            </p>
          </div>
        )}

        {/* DbContext Container */}
        <div className="border-2 border-purple-500/50 rounded-lg p-4 bg-purple-900/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
              <span className="text-sm font-mono text-purple-300">BloggingContext : DbContext</span>
            </div>
            <Button size="sm" variant="outline" onClick={addEntity} className="border-green-500 text-green-400 hover:bg-green-900/30">
              <Plus className="h-3 w-3 mr-1" /> Add {entityType}
            </Button>
          </div>

          {/* DbSet */}
          <div className="border border-gray-700 rounded-lg p-3 bg-gray-900/50">
            <div className="text-xs font-mono text-gray-400 mb-2">
              DbSet&lt;{entityType}&gt; {entityType}s
            </div>
            
            <div className="space-y-2">
              <AnimatePresence>
                {entities.map(entity => (
                  <motion.div
                    key={entity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={cn(
                      'flex items-center justify-between p-2 rounded border',
                      stateColors[entity.state]
                    )}
                  >
                    <div className="flex-1">
                      <span className="text-xs font-mono text-gray-300">
                        Id: {entity.id} | {Object.entries(entity.properties).map(([k, v]) => `${k}: "${v}"`).join(' | ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded',
                        entity.state === 'added' && 'bg-green-800 text-green-300',
                        entity.state === 'modified' && 'bg-yellow-800 text-yellow-300',
                        entity.state === 'deleted' && 'bg-red-800 text-red-300',
                        entity.state === 'unchanged' && 'bg-gray-700 text-gray-400',
                      )}>
                        {stateLabels[entity.state]}
                      </span>
                      {entity.state !== 'deleted' && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => modifyEntity(entity.id)} className="h-6 w-6 p-0">
                            <Edit2 className="h-3 w-3 text-yellow-400" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteEntity(entity.id)} className="h-6 w-6 p-0">
                            <Trash2 className="h-3 w-3 text-red-400" />
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Change Tracker (Intermediate+) */}
          {mode !== 'beginner' && pendingChanges.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 p-2 bg-gray-900 rounded border border-gray-700"
            >
              <div className="text-xs font-medium text-gray-400 mb-1">Change Tracker:</div>
              <div className="space-y-1">
                {pendingChanges.map((change, i) => (
                  <div key={i} className="text-xs font-mono text-cyan-400">{change}</div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* SaveChanges Button */}
        <div className="flex justify-center">
          <Button 
            onClick={saveChanges} 
            disabled={pendingChanges.length === 0 || isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="mr-2"
                >
                  <ArrowDown className="h-4 w-4" />
                </motion.div>
                Saving to Database...
              </>
            ) : (
              <>
                <ArrowDown className="h-4 w-4 mr-2" />
                SaveChanges() ({pendingChanges.length} pending)
              </>
            )}
          </Button>
        </div>

        {/* Arrow to Database */}
        <AnimatePresence>
          {(showDatabase || isSaving) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center"
            >
              <motion.div
                animate={isSaving ? { y: [0, 10, 0] } : {}}
                transition={{ duration: 0.5, repeat: isSaving ? Infinity : 0 }}
              >
                <ArrowDown className={cn('h-8 w-8', isSaving ? 'text-green-400' : 'text-gray-600')} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Database */}
        <AnimatePresence>
          {showDatabase && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-2 border-blue-500/50 rounded-lg p-4 bg-blue-900/10"
            >
              <div className="flex items-center gap-2 mb-3">
                <Database className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-mono text-blue-300">SQL Server Database</span>
                {!isSaving && <CheckCircle className="h-4 w-4 text-green-400" />}
              </div>
              
              <div className="bg-gray-900 rounded p-2 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-1 text-gray-400">Id</th>
                      {Object.keys(savedEntities[0]?.properties || {}).map(key => (
                        <th key={key} className="text-left p-1 text-gray-400">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {savedEntities.map(entity => (
                      <motion.tr 
                        key={entity.id}
                        initial={{ backgroundColor: 'rgba(34, 197, 94, 0.3)' }}
                        animate={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
                        transition={{ duration: 1 }}
                        className="border-b border-gray-800"
                      >
                        <td className="p-1 text-gray-300">{entity.id}</td>
                        {Object.values(entity.properties).map((val, i) => (
                          <td key={i} className="p-1 text-gray-300">{val}</td>
                        ))}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced: Code Generation */}
        {mode === 'advanced' && (
          <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
            <div className="text-xs font-medium text-gray-400 mb-2">Generated SQL (on SaveChanges):</div>
            <pre className="text-xs font-mono text-green-400 overflow-x-auto">
{pendingChanges.map(change => {
  if (change.startsWith('ADD')) return `INSERT INTO ${entityType}s (Title, Url) VALUES (...);`;
  if (change.startsWith('MODIFY')) return `UPDATE ${entityType}s SET Title = '...' WHERE Id = ...;`;
  if (change.startsWith('DELETE')) return `DELETE FROM ${entityType}s WHERE Id = ...;`;
  return '';
}).join('\n') || '-- No pending changes'}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DbContextVisualizer;
