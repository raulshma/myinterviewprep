'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Database, Server, Globe, Link2, Play, RotateCcw, CheckCircle, Plus, Trash2, ArrowRight, Activity, Eye, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface AspireAppBuilderProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
  title?: string;
}

type ResourceType = 'project' | 'database' | 'cache' | 'messaging' | 'storage';

interface AspireResource {
  id: string;
  name: string;
  type: ResourceType;
  status: 'stopped' | 'starting' | 'running' | 'error';
  dependencies: string[];
  port?: number;
  logs?: string[];
}

const resourceTemplates: Record<ResourceType, { icon: string; color: string; examples: string[] }> = {
  project: { icon: '📦', color: 'blue', examples: ['WebAPI', 'Frontend', 'Worker'] },
  database: { icon: '💾', color: 'purple', examples: ['PostgreSQL', 'SQL Server', 'MongoDB'] },
  cache: { icon: '⚡', color: 'orange', examples: ['Redis', 'Garnet'] },
  messaging: { icon: '📨', color: 'green', examples: ['RabbitMQ', 'Azure Service Bus'] },
  storage: { icon: '📁', color: 'cyan', examples: ['Azure Blob', 'Minio'] },
};

const initialResources: AspireResource[] = [
  { id: 'api', name: 'WebAPI', type: 'project', status: 'stopped', dependencies: ['postgres'], port: 5001 },
  { id: 'frontend', name: 'Frontend', type: 'project', status: 'stopped', dependencies: ['api'], port: 5002 },
  { id: 'postgres', name: 'PostgreSQL', type: 'database', status: 'stopped', dependencies: [], port: 5432 },
];

export function AspireAppBuilder({
  mode = 'beginner',
  title = '.NET Aspire App Builder',
}: AspireAppBuilderProps) {
  const [resources, setResources] = useState<AspireResource[]>(initialResources);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [addingResource, setAddingResource] = useState(false);

  const startAll = useCallback(async () => {
    setIsRunning(true);
    
    // Start resources in dependency order
    const startOrder = ['postgres', 'api', 'frontend'];
    
    for (const resourceId of startOrder) {
      setResources(prev =>
        prev.map(r =>
          r.id === resourceId ? { ...r, status: 'starting' as const } : r
        )
      );
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setResources(prev =>
        prev.map(r =>
          r.id === resourceId ? { ...r, status: 'running' as const } : r
        )
      );
    }
    
    setShowDashboard(true);
  }, []);

  const stopAll = useCallback(() => {
    setResources(prev =>
      prev.map(r => ({ ...r, status: 'stopped' as const }))
    );
    setIsRunning(false);
    setShowDashboard(false);
  }, []);

  const addResource = useCallback((type: ResourceType, name: string) => {
    const newResource: AspireResource = {
      id: `${type}-${Date.now()}`,
      name,
      type,
      status: 'stopped',
      dependencies: [],
      port: type === 'project' ? 5000 + resources.length + 1 : undefined,
    };
    setResources(prev => [...prev, newResource]);
    setAddingResource(false);
  }, [resources.length]);

  const removeResource = useCallback((id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
  }, []);

  const reset = useCallback(() => {
    setResources(initialResources);
    setIsRunning(false);
    setShowDashboard(false);
    setSelectedResource(null);
    setAddingResource(false);
  }, []);

  const getResourceColor = (type: ResourceType) => {
    const colors = {
      project: 'border-blue-500 bg-blue-900/20',
      database: 'border-purple-500 bg-purple-900/20',
      cache: 'border-orange-500 bg-orange-900/20',
      messaging: 'border-green-500 bg-green-900/20',
      storage: 'border-cyan-500 bg-cyan-900/20',
    };
    return colors[type];
  };

  const getStatusColor = (status: AspireResource['status']) => {
    const colors = {
      stopped: 'bg-gray-500',
      starting: 'bg-yellow-500 animate-pulse',
      running: 'bg-green-500',
      error: 'bg-red-500',
    };
    return colors[status];
  };

  return (
    <Card className="my-4 overflow-hidden bg-gray-950 border-gray-800">
      <CardHeader className="pb-2 flex flex-row items-center justify-between bg-gray-900/50">
        <CardTitle className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <Rocket className="h-4 w-4 text-purple-400" />
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <Button size="sm" onClick={startAll} className="bg-green-600 hover:bg-green-700">
              <Play className="h-3 w-3 mr-1" />
              Run
            </Button>
          ) : (
            <Button size="sm" onClick={stopAll} variant="outline" className="border-red-600 text-red-400 hover:bg-red-900/30">
              Stop
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={reset} className="text-gray-400 hover:text-white">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Beginner Analogy */}
        {mode === 'beginner' && (
          <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
            <h4 className="font-medium text-purple-300 mb-2">🎪 .NET Aspire = Event Planner for Your Microservices</h4>
            <p className="text-sm text-gray-400">
              Imagine planning a big concert. You need musicians, sound equipment, lighting, catering - all working together.
              <strong className="text-purple-300"> .NET Aspire</strong> is like having a master event planner who:
            </p>
            <ul className="text-sm text-gray-400 mt-2 space-y-1">
              <li>• Starts everything in the right order</li>
              <li>• Connects services together automatically</li>
              <li>• Provides a dashboard to see what&apos;s happening</li>
              <li>• Makes local development feel like production</li>
            </ul>
          </div>
        )}

        {/* App Host Visualization */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-sm font-mono text-purple-400">AspireApp.AppHost</span>
              </div>
            </div>
            {mode !== 'beginner' && !isRunning && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAddingResource(true)}
                className="text-gray-400 border-gray-600"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Resource
              </Button>
            )}
          </div>

          {/* Resource Graph */}
          <div className="p-4">
            <div className="font-mono text-xs text-gray-400 mb-3">
              {"// Program.cs"}
            </div>
            <div className="bg-gray-900 rounded-lg p-4 space-y-3">
              <div className="text-xs text-gray-500">
                var builder = DistributedApplication.CreateBuilder(args);
              </div>
              
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {resources.map(resource => (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={cn(
                        'flex items-center justify-between p-3 rounded border transition-all',
                        getResourceColor(resource.type),
                        selectedResource === resource.id && 'ring-2 ring-white/30',
                      )}
                      onClick={() => setSelectedResource(resource.id)}
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          className={cn('h-2 w-2 rounded-full', getStatusColor(resource.status))}
                          animate={resource.status === 'running' ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span className="text-lg">{resourceTemplates[resource.type].icon}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-200">{resource.name}</div>
                          <div className="text-xs text-gray-500 capitalize">{resource.type}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {resource.port && (
                          <span className="text-xs font-mono text-gray-500">:{resource.port}</span>
                        )}
                        {resource.dependencies.length > 0 && (
                          <span className="text-xs text-gray-600 flex items-center gap-1">
                            <Link2 className="h-3 w-3" />
                            {resource.dependencies.length}
                          </span>
                        )}
                        {mode !== 'beginner' && !isRunning && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeResource(resource.id);
                            }}
                            className="h-6 w-6 p-0 text-gray-500 hover:text-red-400"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="text-xs text-gray-500 pt-2">
                builder.Build().Run();
              </div>
            </div>

            {/* Dependency arrows (Intermediate+) */}
            {mode !== 'beginner' && (
              <div className="mt-4">
                <div className="text-xs text-gray-400 mb-2">Service Dependencies:</div>
                <div className="flex items-center gap-2 flex-wrap">
                  {resources.filter(r => r.dependencies.length > 0).map(resource => (
                    <div key={resource.id} className="flex items-center gap-1 text-xs bg-gray-900 px-2 py-1 rounded">
                      <span className="text-gray-300">{resource.name}</span>
                      <ArrowRight className="h-3 w-3 text-gray-600" />
                      {resource.dependencies.map(depId => {
                        const dep = resources.find(r => r.id === depId);
                        return (
                          <span key={depId} className="text-cyan-400">{dep?.name || depId}</span>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Aspire Dashboard Preview */}
        <AnimatePresence>
          {showDashboard && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="border border-purple-700 rounded-lg overflow-hidden"
            >
              <div className="bg-purple-900/30 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-purple-300">Aspire Dashboard</span>
                </div>
                <span className="text-xs text-gray-500">https://localhost:17888</span>
              </div>
              <div className="p-4 bg-gray-900/50">
                <div className="grid grid-cols-3 gap-3">
                  {resources.map(resource => (
                    <div
                      key={resource.id}
                      className={cn(
                        'p-3 rounded border',
                        resource.status === 'running' ? 'border-green-700 bg-green-900/10' : 'border-gray-700 bg-gray-800/50',
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-200">{resource.name}</span>
                        <div className={cn('h-1.5 w-1.5 rounded-full', getStatusColor(resource.status))} />
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">State</span>
                          <span className="text-green-400 capitalize">{resource.status}</span>
                        </div>
                        {resource.port && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Port</span>
                            <span className="text-cyan-400">{resource.port}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Structured Logs
                  </span>
                  <span className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Distributed Traces
                  </span>
                  <span className="flex items-center gap-1">
                    <Settings className="h-3 w-3" />
                    Metrics
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Resource Modal (Intermediate+) */}
        <AnimatePresence>
          {addingResource && mode !== 'beginner' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setAddingResource(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-gray-900 border border-gray-700 rounded-lg p-4 w-96"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-sm font-medium text-gray-200 mb-4">Add Resource</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(resourceTemplates) as ResourceType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        const name = resourceTemplates[type].examples[0];
                        addResource(type, name);
                      }}
                      className="p-3 rounded border border-gray-700 bg-gray-800 hover:bg-gray-700 text-left transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span>{resourceTemplates[type].icon}</span>
                        <span className="text-sm capitalize text-gray-200">{type}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {resourceTemplates[type].examples.join(', ')}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Code Generation (Advanced) */}
        {mode === 'advanced' && (
          <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
            <div className="text-xs font-medium text-gray-400 mb-2">Generated AppHost Code:</div>
            <pre className="text-xs font-mono text-gray-300 overflow-x-auto">
{`var builder = DistributedApplication.CreateBuilder(args);

${resources.filter(r => r.type === 'database').map(r => 
  `var ${r.id} = builder.Add${r.name === 'PostgreSQL' ? 'Postgres' : 'SqlServer'}("${r.id}");`
).join('\n')}

${resources.filter(r => r.type === 'cache').map(r => 
  `var ${r.id} = builder.AddRedis("${r.id}");`
).join('\n')}

${resources.filter(r => r.type === 'project').map(r => 
  `builder.AddProject<Projects.${r.name}>("${r.id}")${r.dependencies.length > 0 ? `\n    ${r.dependencies.map(d => `.WithReference(${d})`).join('\n    ')}` : ''};`
).join('\n\n')}

builder.Build().Run();`}
            </pre>
          </div>
        )}

        {/* Key Benefits */}
        {mode === 'beginner' && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 bg-gray-900 rounded border border-gray-800">
              <CheckCircle className="h-4 w-4 text-green-400 mb-1" />
              <div className="text-gray-300 font-medium">Easy Setup</div>
              <div className="text-gray-500">One command to start all</div>
            </div>
            <div className="p-2 bg-gray-900 rounded border border-gray-800">
              <Activity className="h-4 w-4 text-purple-400 mb-1" />
              <div className="text-gray-300 font-medium">Built-in Dashboard</div>
              <div className="text-gray-500">Monitor logs & traces</div>
            </div>
            <div className="p-2 bg-gray-900 rounded border border-gray-800">
              <Link2 className="h-4 w-4 text-cyan-400 mb-1" />
              <div className="text-gray-300 font-medium">Service Discovery</div>
              <div className="text-gray-500">Auto-connects services</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AspireAppBuilder;
