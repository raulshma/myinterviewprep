'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Server, Network, Settings, RotateCcw, Plus, Minus, Play, Pause, Terminal, Layers, ArrowUpDown, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface KubernetesClusterVisualizerProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
  title?: string;
}

interface Pod {
  id: string;
  name: string;
  status: 'running' | 'pending' | 'terminating';
  cpu: number;
  memory: number;
}

interface K8sResource {
  type: 'deployment' | 'service' | 'pod' | 'configmap';
  name: string;
  namespace: string;
  status: string;
}

const kubectlCommands = [
  { cmd: 'kubectl get pods', desc: 'List all pods in current namespace' },
  { cmd: 'kubectl get services', desc: 'List all services' },
  { cmd: 'kubectl get deployments', desc: 'List all deployments' },
  { cmd: 'kubectl describe pod <name>', desc: 'Get detailed pod info' },
  { cmd: 'kubectl logs <pod-name>', desc: 'View pod logs' },
  { cmd: 'kubectl apply -f deployment.yaml', desc: 'Apply configuration' },
  { cmd: 'kubectl scale deployment myapp --replicas=3', desc: 'Scale replicas' },
];

export function KubernetesClusterVisualizer({
  mode = 'beginner',
  title = 'Kubernetes Cluster Explorer',
}: KubernetesClusterVisualizerProps) {
  const [pods, setPods] = useState<Pod[]>([
    { id: 'pod-1', name: 'myapp-7d8f9c', status: 'running', cpu: 45, memory: 128 },
    { id: 'pod-2', name: 'myapp-9a4b2e', status: 'running', cpu: 32, memory: 156 },
  ]);
  const [replicaCount, setReplicaCount] = useState(2);
  const [isScaling, setIsScaling] = useState(false);
  const [selectedView, setSelectedView] = useState<'cluster' | 'commands' | 'yaml'>('cluster');
  const [activeCommand, setActiveCommand] = useState<string | null>(null);
  const [commandOutput, setCommandOutput] = useState<string>('');

  const scaleUp = useCallback(async () => {
    if (replicaCount >= 5) return;
    setIsScaling(true);
    
    const newPodId = `pod-${Date.now()}`;
    const newPod: Pod = {
      id: newPodId,
      name: `myapp-${Math.random().toString(36).slice(2, 8)}`,
      status: 'pending',
      cpu: 0,
      memory: 0,
    };
    
    setPods(prev => [...prev, newPod]);
    setReplicaCount(prev => prev + 1);
    
    // Simulate pod startup
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setPods(prev =>
      prev.map(p =>
        p.id === newPodId
          ? { ...p, status: 'running' as const, cpu: Math.floor(Math.random() * 50) + 20, memory: Math.floor(Math.random() * 100) + 100 }
          : p
      )
    );
    setIsScaling(false);
  }, [replicaCount]);

  const scaleDown = useCallback(async () => {
    if (replicaCount <= 1) return;
    setIsScaling(true);
    
    const lastPod = pods[pods.length - 1];
    if (lastPod) {
      setPods(prev =>
        prev.map(p =>
          p.id === lastPod.id ? { ...p, status: 'terminating' as const } : p
        )
      );
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPods(prev => prev.filter(p => p.id !== lastPod.id));
      setReplicaCount(prev => prev - 1);
    }
    setIsScaling(false);
  }, [replicaCount, pods]);

  const runCommand = useCallback(async (cmd: string) => {
    setActiveCommand(cmd);
    setCommandOutput('Executing...');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (cmd.includes('get pods')) {
      setCommandOutput(
        `NAME                  READY   STATUS    RESTARTS   AGE\n` +
        pods.map(p => `${p.name}   1/1     ${p.status.charAt(0).toUpperCase() + p.status.slice(1)}   0          2m`).join('\n')
      );
    } else if (cmd.includes('get services')) {
      setCommandOutput(
        `NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE\nmyapp-svc    ClusterIP   10.0.85.123     <none>        80/TCP    5m`
      );
    } else if (cmd.includes('get deployments')) {
      setCommandOutput(
        `NAME    READY   UP-TO-DATE   AVAILABLE   AGE\nmyapp   ${replicaCount}/${replicaCount}     ${replicaCount}            ${replicaCount}           5m`
      );
    } else {
      setCommandOutput('Command executed successfully.');
    }
  }, [pods, replicaCount]);

  const reset = useCallback(() => {
    setPods([
      { id: 'pod-1', name: 'myapp-7d8f9c', status: 'running', cpu: 45, memory: 128 },
      { id: 'pod-2', name: 'myapp-9a4b2e', status: 'running', cpu: 32, memory: 156 },
    ]);
    setReplicaCount(2);
    setIsScaling(false);
    setActiveCommand(null);
    setCommandOutput('');
  }, []);

  const podStatusColors = {
    running: 'bg-green-500',
    pending: 'bg-yellow-500 animate-pulse',
    terminating: 'bg-red-500 animate-pulse',
  };

  return (
    <Card className="my-4 overflow-hidden bg-gray-950 border-gray-800">
      <CardHeader className="pb-2 flex flex-row items-center justify-between bg-gray-900/50">
        <CardTitle className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <Box className="h-4 w-4 text-blue-400" />
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {mode !== 'beginner' && (
            <div className="flex border border-gray-700 rounded overflow-hidden">
              {(['cluster', 'commands', 'yaml'] as const).map(view => (
                <button
                  key={view}
                  onClick={() => setSelectedView(view)}
                  className={cn(
                    'px-2 py-1 text-xs capitalize',
                    selectedView === view
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700',
                  )}
                >
                  {view}
                </button>
              ))}
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={reset} className="text-gray-400 hover:text-white">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Beginner Analogy */}
        {mode === 'beginner' && (
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <h4 className="font-medium text-blue-300 mb-2">🎼 Kubernetes = Orchestra Conductor</h4>
            <p className="text-sm text-gray-400">
              Imagine an orchestra where each musician is a container running your app. 
              <strong className="text-blue-300"> Kubernetes</strong> is the conductor who:
            </p>
            <ul className="text-sm text-gray-400 mt-2 space-y-1">
              <li>• Decides how many musicians (pods) you need</li>
              <li>• Replaces tired musicians with fresh ones</li>
              <li>• Makes sure the music (app) never stops</li>
              <li>• Scales up for big concerts (high traffic)</li>
            </ul>
          </div>
        )}

        {/* Cluster View */}
        {(selectedView === 'cluster' || mode === 'beginner') && (
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            {/* Cluster Header */}
            <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm text-gray-200">my-cluster</span>
                <span className="text-xs text-gray-500">| namespace: default</span>
              </div>
            </div>

            <div className="p-4">
              {/* Deployment + Service View */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Deployment */}
                <div className="col-span-2 border border-purple-700 rounded-lg p-3 bg-purple-900/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-300">Deployment: myapp</span>
                  </div>
                  
                  {/* ReplicaSet Control */}
                  <div className="flex items-center justify-between mb-3 bg-gray-900/50 rounded p-2">
                    <span className="text-xs text-gray-400">Replicas:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={scaleDown}
                        disabled={isScaling || replicaCount <= 1}
                        className="h-6 w-6 p-0 border-gray-600"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-lg font-medium text-white w-8 text-center">{replicaCount}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={scaleUp}
                        disabled={isScaling || replicaCount >= 5}
                        className="h-6 w-6 p-0 border-gray-600"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Pods Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <AnimatePresence mode="popLayout">
                      {pods.map(pod => (
                        <motion.div
                          key={pod.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8, y: 20 }}
                          className={cn(
                            'border rounded p-2',
                            pod.status === 'running' && 'border-green-700 bg-green-900/20',
                            pod.status === 'pending' && 'border-yellow-700 bg-yellow-900/20',
                            pod.status === 'terminating' && 'border-red-700 bg-red-900/20',
                          )}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <div className={cn('h-2 w-2 rounded-full', podStatusColors[pod.status])} />
                            <span className="text-xs font-mono text-gray-300 truncate">{pod.name}</span>
                          </div>
                          {mode !== 'beginner' && pod.status === 'running' && (
                            <div className="text-xs text-gray-500">
                              <div>CPU: {pod.cpu}%</div>
                              <div>Mem: {pod.memory}Mi</div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Service */}
                <div className="border border-cyan-700 rounded-lg p-3 bg-cyan-900/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Network className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm font-medium text-cyan-300">Service</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 bg-gray-900/50 rounded">
                      <div className="text-gray-400">myapp-svc</div>
                      <div className="text-cyan-400 font-mono">ClusterIP</div>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <ArrowUpDown className="h-3 w-3" />
                      <span>Load balances to {replicaCount} pods</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between text-xs bg-gray-900 rounded p-2">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">
                    Pods: <span className="text-green-400">{pods.filter(p => p.status === 'running').length} running</span>
                  </span>
                  {pods.some(p => p.status === 'pending') && (
                    <span className="text-yellow-400">
                      {pods.filter(p => p.status === 'pending').length} pending
                    </span>
                  )}
                </div>
                {isScaling && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-yellow-400"
                  >
                    Scaling...
                  </motion.span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Commands View (Intermediate+) */}
        {selectedView === 'commands' && mode !== 'beginner' && (
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-200">kubectl commands</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                {kubectlCommands.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => runCommand(item.cmd)}
                    className={cn(
                      'w-full text-left p-2 rounded text-xs transition-all',
                      activeCommand === item.cmd
                        ? 'bg-green-900/30 border border-green-700'
                        : 'bg-gray-800 hover:bg-gray-700 border border-transparent',
                    )}
                  >
                    <div className="font-mono text-green-400">{item.cmd}</div>
                    <div className="text-gray-500 mt-1">{item.desc}</div>
                  </button>
                ))}
              </div>
              <div className="bg-gray-900 rounded p-3">
                <div className="text-xs text-gray-400 mb-2">Output:</div>
                <pre className="font-mono text-xs text-gray-300 whitespace-pre-wrap">
                  {commandOutput || 'Click a command to run it...'}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* YAML View (Advanced) */}
        {selectedView === 'yaml' && mode !== 'beginner' && (
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
              <Settings className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-gray-200">deployment.yaml</span>
            </div>
            <pre className="p-4 bg-gray-900 font-mono text-xs overflow-x-auto">
              <code className="text-gray-300">
{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: default
spec:
  replicas: ${replicaCount}
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        ports:
        - containerPort: 80
        resources:
          limits:
            cpu: "500m"
            memory: "256Mi"
          requests:
            cpu: "100m"
            memory: "128Mi"`}
              </code>
            </pre>
          </div>
        )}

        {/* Key Concepts Legend */}
        {mode === 'beginner' && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 bg-purple-900/20 rounded border border-purple-800">
              <Layers className="h-3 w-3 text-purple-400" />
              <div>
                <div className="text-purple-300 font-medium">Deployment</div>
                <div className="text-gray-500">Manages pods</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-green-900/20 rounded border border-green-800">
              <Box className="h-3 w-3 text-green-400" />
              <div>
                <div className="text-green-300 font-medium">Pod</div>
                <div className="text-gray-500">Container wrapper</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-cyan-900/20 rounded border border-cyan-800">
              <Network className="h-3 w-3 text-cyan-400" />
              <div>
                <div className="text-cyan-300 font-medium">Service</div>
                <div className="text-gray-500">Network endpoint</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default KubernetesClusterVisualizer;
