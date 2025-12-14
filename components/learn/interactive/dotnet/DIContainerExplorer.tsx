'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Box, ArrowRight, Trash2, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type ServiceLifetime = 'Singleton' | 'Scoped' | 'Transient';

export interface DIContainerExplorerProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
  title?: string;
}

interface ServiceRegistration {
  id: string;
  interface: string;
  implementation: string;
  lifetime: ServiceLifetime;
  registeredAt: number;
}

const presetServices: Omit<ServiceRegistration, 'id' | 'registeredAt'>[] = [
  { interface: 'ILogger', implementation: 'ConsoleLogger', lifetime: 'Singleton' },
  { interface: 'IUserRepository', implementation: 'UserRepository', lifetime: 'Scoped' },
  { interface: 'IEmailService', implementation: 'SmtpEmailService', lifetime: 'Transient' },
  { interface: 'IConfiguration', implementation: 'JsonConfiguration', lifetime: 'Singleton' },
  { interface: 'DbContext', implementation: 'AppDbContext', lifetime: 'Scoped' },
];

const lifetimeColors: Record<ServiceLifetime, string> = {
  Singleton: 'bg-purple-500/20 border-purple-500 text-purple-400',
  Scoped: 'bg-blue-500/20 border-blue-500 text-blue-400',
  Transient: 'bg-green-500/20 border-green-500 text-green-400',
};

const methodNames: Record<ServiceLifetime, string> = {
  Singleton: 'AddSingleton',
  Scoped: 'AddScoped',
  Transient: 'AddTransient',
};

export function DIContainerExplorer({
  mode = 'beginner',
  title = 'DI Container Explorer',
}: DIContainerExplorerProps) {
  const [services, setServices] = useState<ServiceRegistration[]>([]);
  const [nextServiceIndex, setNextServiceIndex] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const [resolving, setResolving] = useState<string | null>(null);

  const addNextService = () => {
    if (nextServiceIndex >= presetServices.length) return;
    
    const preset = presetServices[nextServiceIndex];
    const newService: ServiceRegistration = {
      id: `service-${Date.now()}`,
      ...preset,
      registeredAt: Date.now(),
    };
    
    setServices(prev => [...prev, newService]);
    setNextServiceIndex(prev => prev + 1);
  };

  const removeService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const reset = () => {
    setServices([]);
    setNextServiceIndex(0);
    setShowCode(false);
    setResolving(null);
  };

  const resolveService = async (service: ServiceRegistration) => {
    setResolving(service.id);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setResolving(null);
  };

  const generateCode = () => {
    return services.map(s => 
      `builder.Services.${methodNames[s.lifetime]}<${s.interface}, ${s.implementation}>();`
    ).join('\n');
  };

  return (
    <Card className="my-6 overflow-hidden bg-gray-950 border-gray-800">
      <CardHeader className="pb-3 flex flex-row items-center justify-between bg-gray-900/50">
        <CardTitle className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <Box className="h-4 w-4 text-blue-400" />
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCode(!showCode)}
            className={cn(
              "text-xs",
              showCode ? "text-blue-400" : "text-gray-400 hover:text-white"
            )}
          >
            {showCode ? 'Hide Code' : 'Show Code'}
          </Button>
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
        {/* Add Service Button */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={addNextService}
            disabled={nextServiceIndex >= presetServices.length}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Register Service
          </Button>
          {nextServiceIndex < presetServices.length && (
            <span className="text-xs text-gray-500">
              Next: {presetServices[nextServiceIndex].interface}
            </span>
          )}
          {nextServiceIndex >= presetServices.length && (
            <Badge variant="outline" className="text-green-400 border-green-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              All services registered!
            </Badge>
          )}
        </div>

        {/* Service Collection Visualization */}
        <div className="bg-gray-900/50 rounded-lg p-4 min-h-[200px]">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-800">
            <Box className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-medium text-gray-200">
              IServiceCollection
            </span>
            <Badge variant="secondary" className="text-xs">
              {services.length} service{services.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border-2',
                    lifetimeColors[service.lifetime],
                    resolving === service.id && 'ring-2 ring-yellow-400 animate-pulse'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-mono text-sm">
                        {service.interface}
                      </span>
                      <ArrowRight className="h-3 w-3 text-gray-500" />
                      <span className="text-gray-300 font-mono text-sm">
                        {service.implementation}
                      </span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn('text-xs', lifetimeColors[service.lifetime])}
                    >
                      {service.lifetime}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {mode !== 'beginner' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resolveService(service)}
                        disabled={resolving !== null}
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        Resolve
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeService(service.id)}
                      className="text-gray-500 hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {services.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Box className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No services registered yet.</p>
                <p className="text-xs mt-1">Click &quot;Register Service&quot; to add services to the container.</p>
              </div>
            )}
          </div>
        </div>

        {/* Generated Code View */}
        <AnimatePresence>
          {showCode && services.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-900 rounded-lg overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-700">
                <span className="text-xs font-medium text-gray-400">Program.cs</span>
              </div>
              <pre className="p-4 text-sm font-mono overflow-x-auto">
                <code className="text-gray-300">
                  <span className="text-gray-500">{"//"} Service Registration</span>
                  {'\n'}
                  {services.map((s, i) => (
                    <span key={s.id}>
                      <span className="text-purple-400">builder</span>
                      <span className="text-gray-400">.</span>
                      <span className="text-cyan-400">Services</span>
                      <span className="text-gray-400">.</span>
                      <span className="text-yellow-400">{methodNames[s.lifetime]}</span>
                      <span className="text-gray-400">&lt;</span>
                      <span className="text-cyan-400">{s.interface}</span>
                      <span className="text-gray-400">, </span>
                      <span className="text-cyan-400">{s.implementation}</span>
                      <span className="text-gray-400">&gt;();</span>
                      {i < services.length - 1 && '\n'}
                    </span>
                  ))}
                </code>
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips for different modes */}
        {mode === 'beginner' && services.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-xs">
            <span className="text-blue-400 font-medium">💡 Tip:</span>
            <span className="text-gray-400 ml-1">
              The DI container is like a &quot;smart factory&quot; that knows how to create 
              all your services. You tell it what to create at startup, and it handles 
              creating instances when needed!
            </span>
          </div>
        )}

        {mode === 'intermediate' && services.length >= 3 && (
          <div className="bg-gray-900/50 rounded-lg p-3 text-xs">
            <span className="text-gray-200 font-medium">Registration Order:</span>
            <span className="text-gray-400 ml-1">
              Services are resolved in the order they&apos;re registered. If you register 
              the same interface twice, the last one wins!
            </span>
          </div>
        )}

        {mode === 'advanced' && services.length >= 4 && (
          <div className="bg-gray-900/50 rounded-lg p-3 text-xs space-y-2">
            <div>
              <span className="text-gray-200 font-medium">Advanced Methods:</span>
              <span className="text-gray-400 ml-1">
                Use <code className="text-cyan-400">TryAddScoped</code> to register only if not already registered.
              </span>
            </div>
            <div>
              <span className="text-gray-200 font-medium">.NET 8+:</span>
              <span className="text-gray-400 ml-1">
                Use <code className="text-cyan-400">AddKeyedSingleton</code> for keyed services with named keys.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DIContainerExplorer;
