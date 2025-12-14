'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container, Layers, Box, Play, Terminal, Package, ArrowRight, RotateCcw, CheckCircle, Copy, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface DockerDotnetVisualizerProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
  title?: string;
}

interface DockerLayer {
  id: string;
  name: string;
  size: string;
  cached: boolean;
  type: 'base' | 'sdk' | 'app' | 'runtime';
}

interface BuildStage {
  name: string;
  status: 'pending' | 'building' | 'complete';
  layers: DockerLayer[];
}

const dockerfileSteps = [
  { line: 'FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build', explanation: 'Start with the .NET SDK image for building' },
  { line: 'WORKDIR /app', explanation: 'Set the working directory inside the container' },
  { line: 'COPY *.csproj .', explanation: 'Copy project file for restore (cacheable)' },
  { line: 'RUN dotnet restore', explanation: 'Restore NuGet packages' },
  { line: 'COPY . .', explanation: 'Copy all source code' },
  { line: 'RUN dotnet publish -c Release -o /out', explanation: 'Build and publish the app' },
  { line: 'FROM mcr.microsoft.com/dotnet/aspnet:8.0', explanation: 'Switch to smaller runtime image' },
  { line: 'COPY --from=build /out .', explanation: 'Copy only published files from build stage' },
  { line: 'ENTRYPOINT ["dotnet", "MyApp.dll"]', explanation: 'Define how to start the app' },
];

export function DockerDotnetVisualizer({
  mode = 'beginner',
  title = 'Docker for .NET Visualizer',
}: DockerDotnetVisualizerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildComplete, setBuildComplete] = useState(false);
  const [copiedLine, setCopiedLine] = useState<number | null>(null);
  const [containerRunning, setContainerRunning] = useState(false);

  const [buildStages, setBuildStages] = useState<BuildStage[]>([
    {
      name: 'build',
      status: 'pending',
      layers: [
        { id: 'sdk', name: '.NET SDK 8.0', size: '725 MB', cached: true, type: 'sdk' },
        { id: 'restore', name: 'NuGet Packages', size: '85 MB', cached: false, type: 'app' },
        { id: 'src', name: 'Source Code', size: '2 MB', cached: false, type: 'app' },
        { id: 'publish', name: 'Published Output', size: '45 MB', cached: false, type: 'app' },
      ],
    },
    {
      name: 'runtime',
      status: 'pending',
      layers: [
        { id: 'aspnet', name: 'ASP.NET Runtime 8.0', size: '87 MB', cached: true, type: 'runtime' },
        { id: 'app', name: 'Your App', size: '45 MB', cached: false, type: 'app' },
      ],
    },
  ]);

  const simulateBuild = useCallback(async () => {
    setIsBuilding(true);
    setBuildComplete(false);
    setContainerRunning(false);
    setCurrentStep(0);

    // Reset stages
    setBuildStages(prev =>
      prev.map(stage => ({ ...stage, status: 'pending' }))
    );

    // Simulate build progress
    for (let i = 0; i < dockerfileSteps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Update stage status
      if (i === 5) {
        setBuildStages(prev =>
          prev.map((stage, idx) =>
            idx === 0 ? { ...stage, status: 'complete' } : stage
          )
        );
      }
    }

    setBuildStages(prev =>
      prev.map(stage => ({ ...stage, status: 'complete' }))
    );
    setIsBuilding(false);
    setBuildComplete(true);
  }, []);

  const runContainer = useCallback(() => {
    setContainerRunning(true);
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsBuilding(false);
    setBuildComplete(false);
    setContainerRunning(false);
    setBuildStages(prev =>
      prev.map(stage => ({
        ...stage,
        status: 'pending',
      }))
    );
  }, []);

  const copyLine = useCallback((index: number) => {
    navigator.clipboard.writeText(dockerfileSteps[index].line);
    setCopiedLine(index);
    setTimeout(() => setCopiedLine(null), 2000);
  }, []);

  const layerTypeColors = {
    base: 'bg-blue-600',
    sdk: 'bg-purple-600',
    runtime: 'bg-green-600',
    app: 'bg-orange-500',
  };

  return (
    <Card className="my-4 overflow-hidden bg-gray-950 border-gray-800">
      <CardHeader className="pb-2 flex flex-row items-center justify-between bg-gray-900/50">
        <CardTitle className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <Container className="h-4 w-4 text-blue-400" />
          {title}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={reset} className="text-gray-400 hover:text-white">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Beginner Analogy */}
        {mode === 'beginner' && (
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <h4 className="font-medium text-blue-300 mb-2">📦 Docker = Shipping Container for Your App</h4>
            <p className="text-sm text-gray-400">
              Imagine you&apos;re moving to a new house. Instead of packing things in random boxes, you use a 
              <strong className="text-blue-300"> standardized shipping container</strong> that fits on any truck, 
              ship, or train. Docker does the same for your app - it packages everything your app needs 
              (code, runtime, libraries) into a standard container that runs the same way everywhere!
            </p>
          </div>
        )}

        {/* Dockerfile Viewer */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="ml-2 text-sm text-gray-400">Dockerfile</span>
            </div>
            <Button
              size="sm"
              onClick={simulateBuild}
              disabled={isBuilding}
              className="bg-green-600 hover:bg-green-700"
            >
              {isBuilding ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="mr-2"
                  >
                    <Play className="h-3 w-3" />
                  </motion.div>
                  Building...
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Build Image
                </>
              )}
            </Button>
          </div>
          <div className="bg-gray-900 p-4 font-mono text-xs space-y-1">
            {dockerfileSteps.map((step, idx) => (
              <motion.div
                key={idx}
                className={cn(
                  'flex items-start gap-2 p-2 rounded transition-all',
                  isBuilding && currentStep === idx && 'bg-yellow-900/30 border-l-2 border-yellow-500',
                  isBuilding && currentStep > idx && 'bg-green-900/20',
                  !isBuilding && buildComplete && 'bg-green-900/10',
                )}
                animate={isBuilding && currentStep === idx ? { x: [0, 4, 0] } : {}}
                transition={{ duration: 0.3, repeat: isBuilding && currentStep === idx ? Infinity : 0 }}
              >
                <span className="text-gray-600 w-4">{idx + 1}</span>
                <span
                  className={cn(
                    'flex-1',
                    step.line.startsWith('FROM') && 'text-purple-400',
                    step.line.startsWith('WORKDIR') && 'text-blue-400',
                    step.line.startsWith('COPY') && 'text-cyan-400',
                    step.line.startsWith('RUN') && 'text-green-400',
                    step.line.startsWith('ENTRYPOINT') && 'text-orange-400',
                  )}
                >
                  {step.line}
                </span>
                {mode !== 'beginner' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => copyLine(idx)}
                  >
                    {copiedLine === idx ? (
                      <CheckCircle className="h-3 w-3 text-green-400" />
                    ) : (
                      <Copy className="h-3 w-3 text-gray-500" />
                    )}
                  </Button>
                )}
                {isBuilding && currentStep === idx && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-yellow-400"
                  >
                    ⚡
                  </motion.div>
                )}
                {isBuilding && currentStep > idx && (
                  <CheckCircle className="h-3 w-3 text-green-400" />
                )}
              </motion.div>
            ))}
          </div>
          {/* Explanation panel (beginner) */}
          {mode === 'beginner' && isBuilding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-gray-800 px-4 py-3 border-t border-gray-700"
            >
              <p className="text-sm text-cyan-300">
                💡 {dockerfileSteps[currentStep]?.explanation}
              </p>
            </motion.div>
          )}
        </div>

        {/* Multi-Stage Build Visualization (Intermediate+) */}
        {mode !== 'beginner' && (
          <div className="grid grid-cols-2 gap-4">
            {buildStages.map((stage, idx) => (
              <motion.div
                key={stage.name}
                className={cn(
                  'border rounded-lg p-4',
                  stage.status === 'complete' && 'border-green-500 bg-green-900/10',
                  stage.status === 'building' && 'border-yellow-500 bg-yellow-900/10',
                  stage.status === 'pending' && 'border-gray-700 bg-gray-900/50',
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-200 flex items-center gap-2">
                    {idx === 0 ? (
                      <Package className="h-4 w-4 text-purple-400" />
                    ) : (
                      <Server className="h-4 w-4 text-green-400" />
                    )}
                    Stage: {stage.name}
                  </span>
                  {stage.status === 'complete' && (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  )}
                </div>
                <div className="space-y-2">
                  {stage.layers.map(layer => (
                    <div
                      key={layer.id}
                      className={cn(
                        'flex items-center gap-2 text-xs p-2 rounded',
                        stage.status === 'complete' ? 'bg-gray-800' : 'bg-gray-900',
                      )}
                    >
                      <div
                        className={cn('h-2 w-2 rounded', layerTypeColors[layer.type])}
                      />
                      <span className="flex-1 text-gray-300">{layer.name}</span>
                      <span className="text-gray-500">{layer.size}</span>
                      {layer.cached && (
                        <span className="text-xs bg-blue-800 text-blue-200 px-1 rounded">
                          cached
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {stage.name === 'runtime' && stage.status === 'complete' && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-300">Final image size:</span>
                      <span className="text-green-400 font-medium">~132 MB</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      vs SDK image: 725 MB (82% smaller!)
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Arrow between stages (beginner) */}
        {mode === 'beginner' && buildComplete && (
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-900/30 border border-purple-500 rounded flex items-center justify-center">
                <Package className="h-8 w-8 text-purple-400" />
              </div>
              <p className="text-xs text-gray-400 mt-1">Build Stage</p>
              <p className="text-xs text-gray-500">725 MB</p>
            </div>
            <ArrowRight className="h-6 w-6 text-gray-600" />
            <div className="text-center">
              <div className="w-16 h-16 bg-green-900/30 border border-green-500 rounded flex items-center justify-center">
                <Container className="h-8 w-8 text-green-400" />
              </div>
              <p className="text-xs text-gray-400 mt-1">Final Image</p>
              <p className="text-xs text-green-400">132 MB</p>
            </div>
          </div>
        )}

        {/* Container Run Section */}
        <AnimatePresence>
          {buildComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-2 border-dashed border-green-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-green-300">
                  ✅ Image built successfully!
                </span>
                {!containerRunning && (
                  <Button
                    size="sm"
                    onClick={runContainer}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Run Container
                  </Button>
                )}
              </div>

              {containerRunning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-900 rounded p-3 font-mono text-xs"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Terminal className="h-4 w-4 text-cyan-400" />
                    <span className="text-cyan-400">Container Running</span>
                    <motion.div
                      className="h-2 w-2 bg-green-400 rounded-full"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </div>
                  <div className="text-green-400">
                    <p>$ docker run -p 8080:80 myapp</p>
                    <p className="text-gray-500 mt-1">info: Microsoft.Hosting.Lifetime[14]</p>
                    <p className="text-gray-400">Now listening on: http://[::]:80</p>
                    <p className="text-gray-500">info: Microsoft.Hosting.Lifetime[0]</p>
                    <p className="text-gray-400">Application started. Press Ctrl+C to shut down.</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced: Docker Commands Reference */}
        {mode === 'advanced' && (
          <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
            <div className="text-xs font-medium text-gray-400 mb-2">Common Docker Commands:</div>
            <div className="space-y-1 font-mono text-xs">
              <div className="p-1.5 bg-gray-800 rounded">
                <span className="text-cyan-400">docker build</span>
                <span className="text-gray-400"> -t myapp:latest .</span>
              </div>
              <div className="p-1.5 bg-gray-800 rounded">
                <span className="text-cyan-400">docker run</span>
                <span className="text-gray-400"> -p 8080:80 myapp:latest</span>
              </div>
              <div className="p-1.5 bg-gray-800 rounded">
                <span className="text-cyan-400">docker push</span>
                <span className="text-gray-400"> myregistry.azurecr.io/myapp:latest</span>
              </div>
              <div className="p-1.5 bg-gray-800 rounded">
                <span className="text-cyan-400">docker compose up</span>
                <span className="text-gray-400"> -d</span>
              </div>
            </div>
          </div>
        )}

        {/* Layer visualization legend */}
        {mode !== 'beginner' && (
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded bg-purple-600" />
              <span>SDK</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded bg-green-600" />
              <span>Runtime</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded bg-orange-500" />
              <span>App</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DockerDotnetVisualizer;
