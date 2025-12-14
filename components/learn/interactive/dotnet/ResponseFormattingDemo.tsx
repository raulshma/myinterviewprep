'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileJson, FileCode, Globe, Code2, ArrowRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type ResponseFormat = 'json' | 'xml' | 'text';
export type StatusCodeCategory = 'success' | 'redirect' | 'client-error' | 'server-error';

export interface ActionResultType {
  name: string;
  statusCode: number;
  description: string;
  example: string;
}

export interface ResponseFormattingDemoProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
  title?: string;
}

const formatInfo: Record<ResponseFormat, { icon: React.ReactNode; color: string; mime: string }> = {
  json: { icon: <FileJson className="h-4 w-4" />, color: 'text-amber-400 bg-amber-500/20', mime: 'application/json' },
  xml: { icon: <FileCode className="h-4 w-4" />, color: 'text-purple-400 bg-purple-500/20', mime: 'application/xml' },
  text: { icon: <Globe className="h-4 w-4" />, color: 'text-green-400 bg-green-500/20', mime: 'text/plain' },
};

const actionResults: ActionResultType[] = [
  { name: 'Ok()', statusCode: 200, description: 'Success with data', example: 'return Ok(product);' },
  { name: 'Created()', statusCode: 201, description: 'Resource created', example: 'return Created(uri, product);' },
  { name: 'NoContent()', statusCode: 204, description: 'Success, no body', example: 'return NoContent();' },
  { name: 'BadRequest()', statusCode: 400, description: 'Invalid request', example: 'return BadRequest(error);' },
  { name: 'NotFound()', statusCode: 404, description: 'Resource not found', example: 'return NotFound();' },
  { name: 'Problem()', statusCode: 500, description: 'Server error', example: 'return Problem(detail);' },
];

const statusColors: Record<StatusCodeCategory, string> = {
  'success': 'text-green-400 bg-green-500/20 border-green-500/50',
  'redirect': 'text-blue-400 bg-blue-500/20 border-blue-500/50',
  'client-error': 'text-amber-400 bg-amber-500/20 border-amber-500/50',
  'server-error': 'text-red-400 bg-red-500/20 border-red-500/50',
};

function getStatusCategory(code: number): StatusCodeCategory {
  if (code >= 200 && code < 300) return 'success';
  if (code >= 300 && code < 400) return 'redirect';
  if (code >= 400 && code < 500) return 'client-error';
  return 'server-error';
}

const sampleData = {
  json: `{
  "id": 42,
  "name": "Laptop Pro",
  "price": 1299.99,
  "category": "Electronics"
}`,
  xml: `<?xml version="1.0"?>
<Product>
  <Id>42</Id>
  <Name>Laptop Pro</Name>
  <Price>1299.99</Price>
  <Category>Electronics</Category>
</Product>`,
  text: 'Product: Laptop Pro (ID: 42) - $1299.99',
};

export function ResponseFormattingDemo({
  mode = 'beginner',
  title = 'Response Formatting',
}: ResponseFormattingDemoProps) {
  const [acceptHeader, setAcceptHeader] = useState<ResponseFormat>('json');
  const [selectedResult, setSelectedResult] = useState(actionResults[0]);
  const [showNegotiation, setShowNegotiation] = useState(false);

  const runNegotiation = () => {
    setShowNegotiation(false);
    setTimeout(() => setShowNegotiation(true), 100);
  };

  return (
    <Card className="my-4 overflow-hidden bg-gray-950 border-gray-800">
      <CardHeader className="pb-2 bg-gray-900/50">
        <CardTitle className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <Settings className="h-4 w-4 text-cyan-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Accept Header Selection */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Accept Header (Client Preference)</p>
          <div className="flex gap-2">
            {(Object.keys(formatInfo) as ResponseFormat[]).map((format) => {
              const info = formatInfo[format];
              return (
                <Button
                  key={format}
                  variant="ghost"
                  size="sm"
                  onClick={() => setAcceptHeader(format)}
                  className={cn(
                    'text-xs border flex items-center gap-1.5',
                    acceptHeader === format
                      ? info.color + ' border-current'
                      : 'text-gray-400 border-gray-700'
                  )}
                >
                  {info.icon}
                  {info.mime}
                </Button>
              );
            })}
          </div>
          {mode === 'beginner' && (
            <p className="text-xs text-gray-500">
              💡 The Accept header tells the server what format you prefer. Like ordering food in your preferred language!
            </p>
          )}
        </div>

        {/* Action Result Selection */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Action Result Type</p>
          <div className="grid grid-cols-3 gap-2">
            {actionResults.map((result) => {
              const category = getStatusCategory(result.statusCode);
              return (
                <button
                  key={result.name}
                  onClick={() => setSelectedResult(result)}
                  className={cn(
                    'p-2 rounded-lg border text-left transition-all',
                    selectedResult.name === result.name
                      ? statusColors[category]
                      : 'bg-gray-800/30 border-gray-700 hover:border-gray-600'
                  )}
                >
                  <div className="text-xs font-mono font-bold">{result.name}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={cn('text-xs font-bold', statusColors[category].split(' ')[0])}>
                      {result.statusCode}
                    </span>
                    <span className="text-xs text-gray-500">{result.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Negotiation Visualization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Content Negotiation</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={runNegotiation}
              className="text-xs text-gray-400 hover:text-white"
            >
              Simulate Request
            </Button>
          </div>

          <div className="relative flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
            {/* Request */}
            <motion.div
              className={cn(
                'flex-1 p-2 rounded border',
                showNegotiation ? 'bg-blue-500/20 border-blue-500' : 'bg-gray-800 border-gray-700'
              )}
              animate={showNegotiation ? { scale: [1, 1.02, 1] } : {}}
            >
              <div className="text-xs text-gray-400 mb-1">Request</div>
              <div className="text-xs font-mono">
                Accept: <span className={formatInfo[acceptHeader].color.split(' ')[0]}>{formatInfo[acceptHeader].mime}</span>
              </div>
            </motion.div>

            <ArrowRight className={cn('h-4 w-4', showNegotiation ? 'text-cyan-400' : 'text-gray-600')} />

            {/* Server */}
            <motion.div
              className={cn(
                'flex-1 p-2 rounded border',
                showNegotiation ? 'bg-purple-500/20 border-purple-500' : 'bg-gray-800 border-gray-700'
              )}
              animate={showNegotiation ? { scale: [1, 1.02, 1] } : {}}
              transition={{ delay: 0.3 }}
            >
              <div className="text-xs text-gray-400 mb-1">Server</div>
              <div className="text-xs font-mono text-purple-400">
                OutputFormatter
              </div>
            </motion.div>

            <ArrowRight className={cn('h-4 w-4', showNegotiation ? 'text-cyan-400' : 'text-gray-600')} />

            {/* Response */}
            <motion.div
              className={cn(
                'flex-1 p-2 rounded border',
                showNegotiation ? statusColors[getStatusCategory(selectedResult.statusCode)] : 'bg-gray-800 border-gray-700'
              )}
              animate={showNegotiation ? { scale: [1, 1.02, 1] } : {}}
              transition={{ delay: 0.6 }}
            >
              <div className="text-xs text-gray-400 mb-1">Response</div>
              <div className="text-xs font-mono">
                <span className={statusColors[getStatusCategory(selectedResult.statusCode)].split(' ')[0]}>
                  {selectedResult.statusCode}
                </span>
                {' '}{formatInfo[acceptHeader].mime}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Response Preview */}
        <AnimatePresence mode="wait">
          {showNegotiation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Response Body ({formatInfo[acceptHeader].mime})
              </p>
              <pre className="bg-black/50 rounded-lg p-3 text-xs font-mono overflow-x-auto max-h-40">
                <code className={formatInfo[acceptHeader].color.split(' ')[0]}>
                  {sampleData[acceptHeader]}
                </code>
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Code Preview (Intermediate/Advanced) */}
        {mode !== 'beginner' && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1">
              <Code2 className="h-3 w-3" /> Controller Code
            </p>
            <pre className="bg-black/50 rounded-lg p-3 text-xs font-mono overflow-x-auto">
              <code>
                <span className="text-purple-400">[HttpGet(&quot;{'{id}'}&quot;)]</span>{'\n'}
                <span className="text-purple-400">[Produces(&quot;application/json&quot;, &quot;application/xml&quot;)]</span>{'\n'}
                <span className="text-purple-400">public</span> <span className="text-cyan-400">ActionResult{'<'}Product{'>'}</span> <span className="text-amber-400">GetProduct</span>(<span className="text-cyan-400">int</span> id){'\n'}
                {'{'}{'\n'}
                {'    '}<span className="text-purple-400">var</span> product = _repository.GetById(id);{'\n'}
                {'    '}<span className="text-purple-400">if</span> (product == <span className="text-purple-400">null</span>){'\n'}
                {'        '}<span className="text-purple-400">return</span> NotFound();{'\n'}
                {'    '}{'\n'}
                {'    '}<span className="text-purple-400">return</span> <span className="text-amber-400">{selectedResult.name.replace('()', '')}(product)</span>;{'\n'}
                {'}'}
              </code>
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ResponseFormattingDemo;
