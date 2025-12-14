'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Plus, Circle, Box, Sparkles, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type ServiceLifetime = 'Singleton' | 'Scoped' | 'Transient';

export interface ServiceLifetimeDemoProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
  showComparison?: boolean;
  title?: string;
}

interface ServiceInstance {
  id: string;
  lifetime: ServiceLifetime;
  createdAt: number;
  requestId: number;
  instanceNumber: number;
}

const lifetimeConfig: Record<ServiceLifetime, {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  description: string;
  analogy: string;
}> = {
  Singleton: {
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500',
    icon: <Circle className="h-4 w-4 fill-purple-400 text-purple-400" />,
    description: 'One instance for entire app lifetime',
    analogy: '👨‍🍳 Head Chef - Same person serves everyone',
  },
  Scoped: {
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500',
    icon: <Box className="h-4 w-4 text-blue-400" />,
    description: 'One instance per request/scope',
    analogy: '🧑‍🍳 Personal Waiter - One per table group',
  },
  Transient: {
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500',
    icon: <Sparkles className="h-4 w-4 text-green-400" />,
    description: 'New instance every time',
    analogy: '🧻 Napkins - Fresh one each time you ask',
  },
};

export function ServiceLifetimeDemo({
  mode = 'beginner',
  showComparison = true,
  title = 'Service Lifetime Comparison',
}: ServiceLifetimeDemoProps) {
  const [requests, setRequests] = useState<number[]>([]);
  const [instances, setInstances] = useState<ServiceInstance[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [instanceCounters, setInstanceCounters] = useState<Record<ServiceLifetime, number>>({
    Singleton: 0,
    Scoped: 0,
    Transient: 0,
  });

  const reset = useCallback(() => {
    setRequests([]);
    setInstances([]);
    setInstanceCounters({ Singleton: 0, Scoped: 0, Transient: 0 });
    setIsAnimating(false);
  }, []);

  const simulateRequest = useCallback(async () => {
    setIsAnimating(true);
    const requestId = requests.length + 1;
    setRequests(prev => [...prev, requestId]);

    const newInstances: ServiceInstance[] = [];
    const newCounters = { ...instanceCounters };

    // Singleton: Reuse if exists, create only on first request
    const existingSingleton = instances.find(i => i.lifetime === 'Singleton');
    if (!existingSingleton) {
      newCounters.Singleton = 1;
      newInstances.push({
        id: `singleton-1`,
        lifetime: 'Singleton',
        createdAt: Date.now(),
        requestId,
        instanceNumber: 1,
      });
    }

    // Scoped: New instance per request
    newCounters.Scoped++;
    newInstances.push({
      id: `scoped-${newCounters.Scoped}`,
      lifetime: 'Scoped',
      createdAt: Date.now(),
      requestId,
      instanceNumber: newCounters.Scoped,
    });

    // Transient: Simulate 2 injections per request
    const transientCount = mode === 'beginner' ? 1 : 2;
    for (let i = 0; i < transientCount; i++) {
      newCounters.Transient++;
      newInstances.push({
        id: `transient-${newCounters.Transient}`,
        lifetime: 'Transient',
        createdAt: Date.now() + i * 100,
        requestId,
        instanceNumber: newCounters.Transient,
      });
    }

    setInstanceCounters(newCounters);

    // Animate instances appearing
    for (const instance of newInstances) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setInstances(prev => [...prev, instance]);
    }

    setIsAnimating(false);
  }, [requests, instances, instanceCounters, mode]);

  const getInstancesForLifetime = (lifetime: ServiceLifetime, requestId?: number) => {
    return instances.filter(i => 
      i.lifetime === lifetime && 
      (requestId === undefined || i.requestId === requestId)
    );
  };

  return (
    <Card className="my-6 overflow-hidden bg-gray-950 border-gray-800">
      <CardHeader className="pb-3 flex flex-row items-center justify-between bg-gray-900/50">
        <CardTitle className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-400" />
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="text-gray-400 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          {(['Singleton', 'Scoped', 'Transient'] as ServiceLifetime[]).map(lifetime => (
            <div key={lifetime} className="flex items-center gap-2">
              <div className={cn(
                'w-6 h-6 rounded-lg border-2 flex items-center justify-center',
                lifetimeConfig[lifetime].bgColor,
                lifetimeConfig[lifetime].borderColor
              )}>
                {lifetimeConfig[lifetime].icon}
              </div>
              <div>
                <span className={cn('font-medium', lifetimeConfig[lifetime].color)}>
                  {lifetime}
                </span>
                {mode === 'beginner' && (
                  <p className="text-gray-500 text-[10px]">
                    {lifetimeConfig[lifetime].analogy}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={simulateRequest}
            disabled={isAnimating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Simulate HTTP Request
          </Button>
          {requests.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {requests.length} request{requests.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Visualization */}
        {showComparison && requests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {(['Singleton', 'Scoped', 'Transient'] as ServiceLifetime[]).map(lifetime => (
              <div
                key={lifetime}
                className={cn(
                  'rounded-lg border-2 p-3',
                  lifetimeConfig[lifetime].bgColor,
                  lifetimeConfig[lifetime].borderColor
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn('font-medium text-sm', lifetimeConfig[lifetime].color)}>
                    {lifetime}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={cn('text-xs', lifetimeConfig[lifetime].color)}
                  >
                    {getInstancesForLifetime(lifetime).length === 0 
                      ? (lifetime === 'Singleton' && instances.some(i => i.lifetime === 'Singleton') ? 1 : 0)
                      : lifetime === 'Singleton' ? 1 : getInstancesForLifetime(lifetime).length
                    } instance{lifetime === 'Singleton' ? '' : 's'}
                  </Badge>
                </div>
                
                <div className="space-y-2 min-h-[80px]">
                  <AnimatePresence>
                    {requests.map(reqId => {
                      const reqInstances = lifetime === 'Singleton'
                        ? (reqId === 1 ? getInstancesForLifetime(lifetime) : [])
                        : getInstancesForLifetime(lifetime, reqId);
                      
                      if (lifetime === 'Singleton' && reqId > 1) {
                        // Show "reused" indicator for singleton
                        return (
                          <motion.div
                            key={`${lifetime}-reuse-${reqId}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-xs text-gray-500"
                          >
                            <User className="h-3 w-3" />
                            <span>Request #{reqId}: Reused #1</span>
                          </motion.div>
                        );
                      }

                      return reqInstances.map(instance => (
                        <motion.div
                          key={instance.id}
                          initial={{ opacity: 0, scale: 0.8, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className={cn(
                            'flex items-center justify-between px-2 py-1.5 rounded-md text-xs',
                            'bg-gray-900/60 border border-gray-700'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {lifetimeConfig[lifetime].icon}
                            <span className="text-gray-300">
                              Instance #{instance.instanceNumber}
                            </span>
                          </div>
                          <span className="text-gray-500">
                            Req #{instance.requestId}
                          </span>
                        </motion.div>
                      ));
                    })}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Explanation Panel */}
        {requests.length > 0 && mode !== 'beginner' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-900/50 rounded-lg p-4 mt-4"
          >
            <h4 className="text-sm font-medium text-gray-200 mb-2">
              What happened after {requests.length} request{requests.length !== 1 ? 's' : ''}?
            </h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>
                <span className="text-purple-400">Singleton:</span> Still just 1 instance 
                (created on first request, reused forever)
              </li>
              <li>
                <span className="text-blue-400">Scoped:</span> {instanceCounters.Scoped} instance{instanceCounters.Scoped !== 1 ? 's' : ''} 
                {' '}(1 per request, disposed when request ends)
              </li>
              <li>
                <span className="text-green-400">Transient:</span> {instanceCounters.Transient} instance{instanceCounters.Transient !== 1 ? 's' : ''} 
                {' '}(new on every injection point)
              </li>
            </ul>
            
            {mode === 'advanced' && (
              <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs">
                <span className="text-yellow-400 font-medium">⚠️ Best Practice:</span>
                <span className="text-gray-400 ml-1">
                  Never inject a Scoped service into a Singleton! The scoped service becomes 
                  a &quot;captive dependency&quot; and lives forever, causing memory leaks.
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {requests.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click &quot;Simulate HTTP Request&quot; to see how service lifetimes work!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ServiceLifetimeDemo;
