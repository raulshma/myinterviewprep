'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileJson, Search, Link2, FileText, Server, Check, AlertTriangle, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type BindingSource = 'body' | 'query' | 'route' | 'header' | 'form';

export interface BindingParameter {
  name: string;
  type: string;
  source: BindingSource;
  required: boolean;
  value?: string;
  validationRules?: string[];
}

export interface ModelBindingVisualizerProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
  title?: string;
}

const bindingSourceInfo: Record<BindingSource, { icon: React.ReactNode; color: string; label: string; description: string }> = {
  body: { 
    icon: <FileJson className="h-4 w-4" />, 
    color: 'text-blue-400 bg-blue-500/20 border-blue-500/50', 
    label: '[FromBody]',
    description: 'Data from request body (JSON/XML)'
  },
  query: { 
    icon: <Search className="h-4 w-4" />, 
    color: 'text-purple-400 bg-purple-500/20 border-purple-500/50', 
    label: '[FromQuery]',
    description: 'Data from URL query string (?key=value)'
  },
  route: { 
    icon: <Link2 className="h-4 w-4" />, 
    color: 'text-amber-400 bg-amber-500/20 border-amber-500/50', 
    label: '[FromRoute]',
    description: 'Data from URL route segment ({id})'
  },
  header: { 
    icon: <FileText className="h-4 w-4" />, 
    color: 'text-green-400 bg-green-500/20 border-green-500/50', 
    label: '[FromHeader]',
    description: 'Data from HTTP headers'
  },
  form: { 
    icon: <Server className="h-4 w-4" />, 
    color: 'text-pink-400 bg-pink-500/20 border-pink-500/50', 
    label: '[FromForm]',
    description: 'Data from form submission'
  },
};

const exampleScenarios = [
  {
    name: 'Update Product',
    endpoint: 'PUT /api/products/{id}?notify=true',
    parameters: [
      { name: 'id', type: 'int', source: 'route' as BindingSource, required: true, value: '42' },
      { name: 'notify', type: 'bool', source: 'query' as BindingSource, required: false, value: 'true' },
      { name: 'product', type: 'ProductDto', source: 'body' as BindingSource, required: true, validationRules: ['[Required]', '[StringLength(100)]'] },
    ],
  },
  {
    name: 'Search Products',
    endpoint: 'GET /api/products?category={cat}&minPrice={price}',
    parameters: [
      { name: 'category', type: 'string', source: 'query' as BindingSource, required: false, value: 'electronics' },
      { name: 'minPrice', type: 'decimal?', source: 'query' as BindingSource, required: false, value: '99.99' },
      { name: 'X-Request-ID', type: 'string', source: 'header' as BindingSource, required: false, value: 'req-123' },
    ],
  },
  {
    name: 'Create Order',
    endpoint: 'POST /api/orders',
    parameters: [
      { name: 'order', type: 'CreateOrderDto', source: 'body' as BindingSource, required: true, validationRules: ['[Required]'] },
      { name: 'Authorization', type: 'string', source: 'header' as BindingSource, required: true, value: 'Bearer token...' },
    ],
  },
];

export function ModelBindingVisualizer({
  mode = 'beginner',
  title = 'Model Binding & Validation',
}: ModelBindingVisualizerProps) {
  const [selectedScenario, setSelectedScenario] = useState(exampleScenarios[0]);
  const [showValidation, setShowValidation] = useState(false);
  const [validationPassed, setValidationPassed] = useState(true);

  const simulateValidation = () => {
    setShowValidation(true);
    // Simulate validation pass/fail
    setValidationPassed(Math.random() > 0.3);
  };

  return (
    <Card className="my-4 overflow-hidden bg-gray-950 border-gray-800">
      <CardHeader className="pb-2 bg-gray-900/50">
        <CardTitle className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <FileJson className="h-4 w-4 text-blue-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Scenario Selector */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Select Scenario</p>
          <div className="flex flex-wrap gap-2">
            {exampleScenarios.map((scenario) => (
              <Button
                key={scenario.name}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedScenario(scenario);
                  setShowValidation(false);
                }}
                className={cn(
                  'text-xs border border-gray-700',
                  selectedScenario.name === scenario.name
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                {scenario.name}
              </Button>
            ))}
          </div>
          <div className="text-xs font-mono text-gray-500 bg-gray-800/50 px-3 py-1.5 rounded">
            {selectedScenario.endpoint}
          </div>
        </div>

        {/* Binding Sources Visualization */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Parameter Binding</p>
          <div className="grid gap-2">
            {selectedScenario.parameters.map((param, index) => {
              const sourceInfo = bindingSourceInfo[param.source];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border',
                    sourceInfo.color
                  )}
                >
                  <div className="flex items-center gap-2">
                    {sourceInfo.icon}
                    <span className="text-xs font-bold">{sourceInfo.label}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-white">{param.name}</span>
                      <span className="text-xs text-gray-500">: {param.type}</span>
                      {param.required && (
                        <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">required</span>
                      )}
                    </div>
                    {mode === 'beginner' && (
                      <p className="text-xs text-gray-400 mt-1">{sourceInfo.description}</p>
                    )}
                  </div>
                  
                  {param.value && (
                    <code className="text-xs bg-black/30 px-2 py-1 rounded text-gray-300">
                      {param.value.length > 20 ? param.value.slice(0, 20) + '...' : param.value}
                    </code>
                  )}
                  
                  {param.validationRules && mode !== 'beginner' && (
                    <div className="flex gap-1">
                      {param.validationRules.map((rule, i) => (
                        <span key={i} className="text-xs bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded">
                          {rule}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Validation Demo */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Validation</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={simulateValidation}
              className="text-xs text-gray-400 hover:text-white"
            >
              Simulate Request
            </Button>
          </div>
          
          <AnimatePresence mode="wait">
            {showValidation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  'p-3 rounded-lg border',
                  validationPassed
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  {validationPassed ? (
                    <>
                      <Check className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium text-green-400">ModelState.IsValid = true</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-medium text-red-400">ModelState.IsValid = false</span>
                    </>
                  )}
                </div>
                
                {!validationPassed && (
                  <pre className="text-xs font-mono bg-black/30 p-2 rounded mt-2 overflow-x-auto">
{`{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Name": ["The Name field is required."],
    "Price": ["Price must be greater than 0."]
  }
}`}
                  </pre>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Code Preview (Intermediate/Advanced) */}
        {mode !== 'beginner' && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1">
              <Code2 className="h-3 w-3" /> Action Signature
            </p>
            <pre className="bg-black/50 rounded-lg p-3 text-xs font-mono overflow-x-auto">
              <code>
                <span className="text-purple-400">[HttpPut(&quot;{'{id}'}&quot;)]</span>{'\n'}
                <span className="text-purple-400">public async</span> <span className="text-cyan-400">Task{'<'}IActionResult{'>'}</span> <span className="text-amber-400">Update</span>({'\n'}
                {selectedScenario.parameters.map((p, i) => (
                  <span key={i}>
                    {'    '}<span className="text-purple-400">{bindingSourceInfo[p.source].label}</span> <span className="text-cyan-400">{p.type}</span> {p.name}{i < selectedScenario.parameters.length - 1 ? ',' : ''}{'\n'}
                  </span>
                ))}
                ){'\n'}
                {'{'}{'\n'}
                {'    '}<span className="text-purple-400">if</span> (!ModelState.IsValid){'\n'}
                {'        '}<span className="text-purple-400">return</span> ValidationProblem();{'\n'}
                {'    '}{'\n'}
                {'    '}<span className="text-gray-500">{"//"} Process request...</span>{'\n'}
                {'    '}<span className="text-purple-400">return</span> NoContent();{'\n'}
                {'}'}
              </code>
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ModelBindingVisualizer;
