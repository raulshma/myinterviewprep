'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Route, Check, X, Info, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface RouteTemplate {
  template: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
  actionName: string;
  description: string;
}

export interface RoutingAttributeExplorerProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
  title?: string;
}

const defaultRoutes: RouteTemplate[] = [
  { template: 'api/products', httpMethod: 'GET', actionName: 'GetAll', description: 'List all products' },
  { template: 'api/products/{id}', httpMethod: 'GET', actionName: 'GetById', description: 'Get product by ID' },
  { template: 'api/products/{id}/reviews', httpMethod: 'GET', actionName: 'GetReviews', description: 'Get product reviews' },
  { template: 'api/products/category/{name}', httpMethod: 'GET', actionName: 'GetByCategory', description: 'Filter by category' },
  { template: 'api/products', httpMethod: 'POST', actionName: 'Create', description: 'Create new product' },
  { template: 'api/products/{id}', httpMethod: 'PUT', actionName: 'Update', description: 'Update product' },
  { template: 'api/products/{id}', httpMethod: 'DELETE', actionName: 'Delete', description: 'Delete product' },
];

const methodColors: Record<string, string> = {
  GET: 'bg-green-500/20 text-green-400 border-green-500/50',
  POST: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  PUT: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  DELETE: 'bg-red-500/20 text-red-400 border-red-500/50',
};

function parseRouteTemplate(template: string): { segments: string[]; params: string[] } {
  const segments = template.split('/');
  const params: string[] = [];
  
  segments.forEach(seg => {
    const match = seg.match(/\{(\w+)\}/);
    if (match) params.push(match[1]);
  });
  
  return { segments, params };
}

function matchRoute(template: string, url: string, method: string, routeMethod: string): { matches: boolean; params: Record<string, string> } {
  if (method !== routeMethod) return { matches: false, params: {} };
  
  const templateParts = template.split('/');
  const urlParts = url.replace(/^\//, '').split('/');
  
  if (templateParts.length !== urlParts.length) return { matches: false, params: {} };
  
  const params: Record<string, string> = {};
  
  for (let i = 0; i < templateParts.length; i++) {
    const tPart = templateParts[i];
    const uPart = urlParts[i];
    
    const paramMatch = tPart.match(/\{(\w+)\}/);
    if (paramMatch) {
      params[paramMatch[1]] = uPart;
    } else if (tPart.toLowerCase() !== uPart.toLowerCase()) {
      return { matches: false, params: {} };
    }
  }
  
  return { matches: true, params };
}

export function RoutingAttributeExplorer({
  mode = 'beginner',
  title = 'API Routing Explorer',
}: RoutingAttributeExplorerProps) {
  const [testUrl, setTestUrl] = useState('api/products/42');
  const [testMethod, setTestMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');

  const matchResults = useMemo(() => {
    return defaultRoutes.map(route => ({
      route,
      result: matchRoute(route.template, testUrl, testMethod, route.httpMethod),
    }));
  }, [testUrl, testMethod]);

  const matchedRoute = matchResults.find(r => r.result.matches);

  const getExplanation = (): string => {
    if (!testUrl.trim()) {
      return mode === 'beginner' 
        ? '✏️ Type a URL path above to see which route matches!'
        : 'Enter a request path to test route matching';
    }
    
    if (matchedRoute) {
      const { route, result } = matchedRoute;
      if (mode === 'beginner') {
        return `🎯 Found it! The URL matches "${route.actionName}" action. ${Object.keys(result.params).length > 0 ? `Parameters captured: ${JSON.stringify(result.params)}` : ''}`;
      }
      return `Route matched: [Http${route.httpMethod.charAt(0) + route.httpMethod.slice(1).toLowerCase()}("${route.template}")] → ${route.actionName}(${Object.entries(result.params).map(([k, v]) => `${k}=${v}`).join(', ')})`;
    }
    
    return mode === 'beginner'
      ? '❌ No route matches this URL and method combination. Try changing the path or HTTP method.'
      : `No matching route found for ${testMethod} ${testUrl}. Check route templates and constraints.`;
  };

  return (
    <Card className="my-4 overflow-hidden bg-gray-950 border-gray-800">
      <CardHeader className="pb-2 bg-gray-900/50">
        <CardTitle className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <Route className="h-4 w-4 text-cyan-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* URL Tester */}
        <div className="space-y-3">
          <div className="flex gap-2">
            {(['GET', 'POST', 'PUT', 'DELETE'] as const).map(method => (
              <Button
                key={method}
                variant="ghost"
                size="sm"
                onClick={() => setTestMethod(method)}
                className={cn(
                  'text-xs font-bold border',
                  methodColors[method],
                  testMethod === method ? 'ring-2 ring-white/30' : 'opacity-50'
                )}
              >
                {method}
              </Button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-gray-500 text-sm font-mono">/</span>
            <Input
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="api/products/42"
              className="bg-gray-800 border-gray-700 font-mono text-sm"
            />
          </div>
        </div>

        {/* Route Table */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Defined Routes</p>
          <div className="space-y-1">
            {matchResults.map(({ route, result }, index) => {
              const { segments, params } = parseRouteTemplate(route.template);
              
              return (
                <motion.div
                  key={index}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-lg border transition-all',
                    result.matches
                      ? 'bg-green-500/10 border-green-500/50'
                      : 'bg-gray-800/30 border-gray-700/50'
                  )}
                  animate={result.matches ? { scale: [1, 1.01, 1] } : {}}
                >
                  <span className={cn(
                    'px-2 py-0.5 rounded text-xs font-bold border',
                    methodColors[route.httpMethod]
                  )}>
                    {route.httpMethod}
                  </span>
                  
                  <code className="flex-1 text-sm font-mono text-gray-300">
                    {segments.map((seg, i) => (
                      <span key={i}>
                        {i > 0 && <span className="text-gray-600">/</span>}
                        {seg.match(/\{(\w+)\}/) ? (
                          <span className="text-amber-400">{seg}</span>
                        ) : (
                          <span>{seg}</span>
                        )}
                      </span>
                    ))}
                  </code>
                  
                  <span className="text-xs text-gray-500">{route.actionName}</span>
                  
                  {result.matches ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <X className="h-4 w-4 text-gray-600" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Match Explanation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={matchedRoute?.route.template || 'no-match'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'rounded-lg p-3 border',
              matchedRoute
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-gray-800/50 border-gray-700'
            )}
          >
            <p className="text-sm text-gray-300">{getExplanation()}</p>
            {matchedRoute && Object.keys(matchedRoute.result.params).length > 0 && (
              <div className="mt-2 flex gap-2">
                {Object.entries(matchedRoute.result.params).map(([key, value]) => (
                  <span key={key} className="px-2 py-1 bg-amber-500/20 rounded text-xs font-mono text-amber-400">
                    {key} = &quot;{value}&quot;
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Code Preview (Intermediate/Advanced) */}
        {mode !== 'beginner' && matchedRoute && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1">
              <Code2 className="h-3 w-3" /> Route Attribute
            </p>
            <pre className="bg-black/50 rounded-lg p-3 text-xs font-mono overflow-x-auto">
              <code>
                <span className="text-purple-400">[Http{matchedRoute.route.httpMethod.charAt(0) + matchedRoute.route.httpMethod.slice(1).toLowerCase()}(&quot;{matchedRoute.route.template.replace('api/products', '')}&quot;)]</span>{'\n'}
                <span className="text-purple-400">public</span> <span className="text-cyan-400">ActionResult</span> <span className="text-amber-400">{matchedRoute.route.actionName}</span>(
                {Object.keys(matchedRoute.result.params).map((p, i) => (
                  <span key={p}>
                    {i > 0 && ', '}
                    <span className="text-cyan-400">int</span> {p}
                  </span>
                ))}
                ){'\n'}
                {'{'}{'\n'}
                {'    '}<span className="text-gray-500">{"//"} {matchedRoute.route.description}</span>{'\n'}
                {'}'}
              </code>
            </pre>
          </div>
        )}

        {/* Beginner Tip */}
        {mode === 'beginner' && (
          <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <Info className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-300">
              <strong>Think of routes like GPS coordinates!</strong> When you visit a URL, ASP.NET Core looks through all defined routes to find a match. Parts in {'{curly braces}'} capture values from the URL.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RoutingAttributeExplorer;
