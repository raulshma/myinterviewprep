'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Server, ArrowRight, Code2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ControllerAction {
  name: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  route: string;
  description: string;
  returnType: string;
  statusCode: number;
}

export interface WebApiControllerVisualizerProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
  title?: string;
}

const methodColors: Record<string, string> = {
  GET: 'bg-green-500/20 text-green-400 border-green-500/50',
  POST: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  PUT: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  DELETE: 'bg-red-500/20 text-red-400 border-red-500/50',
  PATCH: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
};

const statusCodeInfo: Record<number, { icon: React.ReactNode; color: string; label: string }> = {
  200: { icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-green-400', label: 'OK' },
  201: { icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-green-400', label: 'Created' },
  204: { icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-green-400', label: 'No Content' },
  400: { icon: <AlertCircle className="h-4 w-4" />, color: 'text-amber-400', label: 'Bad Request' },
  404: { icon: <XCircle className="h-4 w-4" />, color: 'text-red-400', label: 'Not Found' },
  500: { icon: <XCircle className="h-4 w-4" />, color: 'text-red-400', label: 'Server Error' },
};

const defaultActions: ControllerAction[] = [
  { name: 'GetAll', httpMethod: 'GET', route: '/api/products', description: 'Retrieve all products', returnType: 'IEnumerable<Product>', statusCode: 200 },
  { name: 'GetById', httpMethod: 'GET', route: '/api/products/{id}', description: 'Get a specific product', returnType: 'Product', statusCode: 200 },
  { name: 'Create', httpMethod: 'POST', route: '/api/products', description: 'Create a new product', returnType: 'Product', statusCode: 201 },
  { name: 'Update', httpMethod: 'PUT', route: '/api/products/{id}', description: 'Update an existing product', returnType: 'void', statusCode: 204 },
  { name: 'Delete', httpMethod: 'DELETE', route: '/api/products/{id}', description: 'Delete a product', returnType: 'void', statusCode: 204 },
];

type FlowStep = 'idle' | 'request' | 'controller' | 'action' | 'response';

export function WebApiControllerVisualizer({
  mode = 'beginner',
  title = 'Web API Controller Flow',
}: WebApiControllerVisualizerProps) {
  const [selectedAction, setSelectedAction] = useState<ControllerAction>(defaultActions[0]);
  const [flowStep, setFlowStep] = useState<FlowStep>('idle');
  const [isPlaying, setIsPlaying] = useState(false);

  const runFlow = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setFlowStep('idle');
      return;
    }

    setIsPlaying(true);
    setFlowStep('request');

    const steps: FlowStep[] = ['request', 'controller', 'action', 'response'];
    let stepIndex = 0;

    const interval = setInterval(() => {
      stepIndex++;
      if (stepIndex >= steps.length) {
        clearInterval(interval);
        setIsPlaying(false);
        setTimeout(() => setFlowStep('idle'), 2000);
      } else {
        setFlowStep(steps[stepIndex]);
      }
    }, 1200);
  };

  const reset = () => {
    setIsPlaying(false);
    setFlowStep('idle');
  };

  const getStepExplanation = (step: FlowStep): string => {
    switch (step) {
      case 'request':
        return mode === 'beginner'
          ? '📨 A request arrives at your API! Like a customer walking into a restaurant.'
          : `HTTP ${selectedAction.httpMethod} request received at ${selectedAction.route}`;
      case 'controller':
        return mode === 'beginner'
          ? '🎯 The controller catches the request! Like a host directing you to your table.'
          : 'ProductsController activated - routing matched this controller based on [Route] attribute';
      case 'action':
        return mode === 'beginner'
          ? `⚡ The ${selectedAction.name} action runs! Like a waiter taking your specific order.`
          : `Executing ${selectedAction.name}() action method with ${selectedAction.returnType} return type`;
      case 'response':
        const info = statusCodeInfo[selectedAction.statusCode];
        return mode === 'beginner'
          ? `✅ Response sent back! Status: ${selectedAction.statusCode} ${info.label}`
          : `ActionResult returned: ${selectedAction.statusCode} ${info.label} with ${selectedAction.returnType}`;
      default:
        return 'Click Play to see how a request flows through your Web API';
    }
  };

  return (
    <Card className="my-4 overflow-hidden bg-gray-950 border-gray-800">
      <CardHeader className="pb-2 flex flex-row items-center justify-between bg-gray-900/50">
        <CardTitle className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <Server className="h-4 w-4 text-blue-400" />
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={runFlow}
            className="text-gray-400 hover:text-white"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
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
        {/* Action Selector */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Select an Action</p>
          <div className="flex flex-wrap gap-2">
            {defaultActions.map((action) => (
              <button
                key={action.name}
                onClick={() => setSelectedAction(action)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium border transition-all',
                  methodColors[action.httpMethod],
                  selectedAction.name === action.name
                    ? 'ring-2 ring-white/30'
                    : 'opacity-60 hover:opacity-100'
                )}
              >
                <span className="font-bold mr-1">{action.httpMethod}</span>
                {action.name}
              </button>
            ))}
          </div>
        </div>

        {/* Flow Visualization */}
        <div className="relative">
          <div className="flex items-center justify-between gap-2">
            {/* Request */}
            <motion.div
              className={cn(
                'flex-1 p-3 rounded-lg border transition-all',
                flowStep === 'request'
                  ? 'bg-blue-500/20 border-blue-500'
                  : 'bg-gray-800/50 border-gray-700'
              )}
              animate={flowStep === 'request' ? { scale: [1, 1.02, 1] } : {}}
            >
              <div className="text-xs font-medium text-gray-400 mb-1">HTTP Request</div>
              <div className={cn('text-sm font-mono', methodColors[selectedAction.httpMethod].split(' ')[1])}>
                {selectedAction.httpMethod} {selectedAction.route}
              </div>
            </motion.div>

            <ArrowRight className={cn(
              'h-5 w-5 transition-colors',
              flowStep === 'request' ? 'text-blue-400' : 'text-gray-600'
            )} />

            {/* Controller */}
            <motion.div
              className={cn(
                'flex-1 p-3 rounded-lg border transition-all',
                flowStep === 'controller'
                  ? 'bg-purple-500/20 border-purple-500'
                  : 'bg-gray-800/50 border-gray-700'
              )}
              animate={flowStep === 'controller' ? { scale: [1, 1.02, 1] } : {}}
            >
              <div className="text-xs font-medium text-gray-400 mb-1">Controller</div>
              <div className="text-sm font-mono text-purple-400">ProductsController</div>
            </motion.div>

            <ArrowRight className={cn(
              'h-5 w-5 transition-colors',
              flowStep === 'controller' ? 'text-purple-400' : 'text-gray-600'
            )} />

            {/* Action */}
            <motion.div
              className={cn(
                'flex-1 p-3 rounded-lg border transition-all',
                flowStep === 'action'
                  ? 'bg-amber-500/20 border-amber-500'
                  : 'bg-gray-800/50 border-gray-700'
              )}
              animate={flowStep === 'action' ? { scale: [1, 1.02, 1] } : {}}
            >
              <div className="text-xs font-medium text-gray-400 mb-1">Action Method</div>
              <div className="text-sm font-mono text-amber-400">{selectedAction.name}()</div>
            </motion.div>

            <ArrowRight className={cn(
              'h-5 w-5 transition-colors',
              flowStep === 'action' ? 'text-amber-400' : 'text-gray-600'
            )} />

            {/* Response */}
            <motion.div
              className={cn(
                'flex-1 p-3 rounded-lg border transition-all',
                flowStep === 'response'
                  ? 'bg-green-500/20 border-green-500'
                  : 'bg-gray-800/50 border-gray-700'
              )}
              animate={flowStep === 'response' ? { scale: [1, 1.02, 1] } : {}}
            >
              <div className="text-xs font-medium text-gray-400 mb-1">Response</div>
              <div className={cn('text-sm font-mono flex items-center gap-1', statusCodeInfo[selectedAction.statusCode]?.color)}>
                {statusCodeInfo[selectedAction.statusCode]?.icon}
                {selectedAction.statusCode}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Explanation Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={flowStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gray-800/50 rounded-lg p-3 border border-gray-700"
          >
            <p className="text-sm text-gray-300">{getStepExplanation(flowStep)}</p>
          </motion.div>
        </AnimatePresence>

        {/* Code Preview (Intermediate/Advanced) */}
        {mode !== 'beginner' && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1">
              <Code2 className="h-3 w-3" /> Controller Code
            </p>
            <pre className="bg-black/50 rounded-lg p-3 text-xs font-mono overflow-x-auto">
              <code>
                <span className="text-gray-500">{"//"} ProductsController.cs</span>{'\n'}
                <span className="text-purple-400">[ApiController]</span>{'\n'}
                <span className="text-purple-400">[Route(&quot;api/[controller]&quot;)]</span>{'\n'}
                <span className="text-purple-400">public class</span> <span className="text-cyan-400">ProductsController</span> : <span className="text-cyan-400">ControllerBase</span>{'\n'}
                {'{'}{'\n'}
                {'    '}<span className="text-purple-400">[Http{selectedAction.httpMethod.charAt(0) + selectedAction.httpMethod.slice(1).toLowerCase()}]</span>{'\n'}
                {'    '}<span className="text-purple-400">public</span> <span className="text-cyan-400">ActionResult</span>{'<'}<span className="text-cyan-400">{selectedAction.returnType}</span>{'>'} <span className="text-amber-400">{selectedAction.name}</span>(){'\n'}
                {'    {'}{'\n'}
                {'        '}<span className="text-gray-500">{"//"} {selectedAction.description}</span>{'\n'}
                {'        '}<span className="text-purple-400">return</span> Ok(result);{'\n'}
                {'    }'}{'\n'}
                {'}'}
              </code>
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WebApiControllerVisualizer;
