'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code,
  Play,
  Copy,
  Check,
  ChevronRight,
  Wand2,
  FileCode,
  Factory,
  ArrowRight,
  ArrowDown,
  Settings,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface CustomMiddlewareBuilderProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
  title?: string;
}

type MiddlewareType = 'inline' | 'convention' | 'factory';

interface MiddlewareConfig {
  name: string;
  beforeNext: string;
  afterNext: string;
  shortCircuit: boolean;
  shortCircuitCondition: string;
  injectService: boolean;
  serviceName: string;
}

const defaultConfig: MiddlewareConfig = {
  name: 'RequestLogging',
  beforeNext: 'Console.WriteLine($"Request: {context.Request.Path}");',
  afterNext: 'Console.WriteLine($"Response: {context.Response.StatusCode}");',
  shortCircuit: false,
  shortCircuitCondition: 'context.Request.Path.StartsWithSegments("/blocked")',
  injectService: false,
  serviceName: 'ILogger<MyMiddleware>',
};

export function CustomMiddlewareBuilder({
  mode = 'beginner',
  title = 'Custom Middleware Builder',
}: CustomMiddlewareBuilderProps) {
  const [middlewareType, setMiddlewareType] = useState<MiddlewareType>(
    mode === 'beginner' ? 'inline' : mode === 'intermediate' ? 'convention' : 'factory'
  );
  const [config, setConfig] = useState<MiddlewareConfig>(defaultConfig);
  const [copied, setCopied] = useState(false);
  const [showFlow, setShowFlow] = useState(false);

  const updateConfig = (key: keyof MiddlewareConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const generateInlineCode = (): string => {
    let code = `app.Use(async (context, next) =>
{
    // Before the next middleware
    ${config.beforeNext}
`;
    
    if (config.shortCircuit) {
      code += `
    // Short-circuit condition
    if (${config.shortCircuitCondition})
    {
        context.Response.StatusCode = 403;
        await context.Response.WriteAsync("Blocked!");
        return; // Don't call next - request stops here
    }
`;
    }

    code += `
    await next(); // Call the next middleware
    
    // After the next middleware (on the way back)
    ${config.afterNext}
});`;
    
    return code;
  };

  const generateConventionCode = (): string => {
    let code = `// ${config.name}Middleware.cs
public class ${config.name}Middleware
{
    private readonly RequestDelegate _next;`;
    
    if (config.injectService) {
      code += `
    private readonly ${config.serviceName} _logger;

    public ${config.name}Middleware(RequestDelegate next, ${config.serviceName} logger)
    {
        _next = next;
        _logger = logger;
    }`;
    } else {
      code += `

    public ${config.name}Middleware(RequestDelegate next)
    {
        _next = next;
    }`;
    }

    code += `

    public async Task InvokeAsync(HttpContext context)
    {
        // Before the next middleware
        ${config.beforeNext}
`;

    if (config.shortCircuit) {
      code += `
        // Short-circuit condition
        if (${config.shortCircuitCondition})
        {
            context.Response.StatusCode = 403;
            await context.Response.WriteAsync("Blocked!");
            return;
        }
`;
    }

    code += `
        await _next(context);

        // After the next middleware
        ${config.afterNext}
    }
}

// Extension method for clean registration
public static class ${config.name}MiddlewareExtensions
{
    public static IApplicationBuilder Use${config.name}(
        this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<${config.name}Middleware>();
    }
}

// Usage in Program.cs:
// app.Use${config.name}();`;

    return code;
  };

  const generateFactoryCode = (): string => {
    let code = `// ${config.name}Middleware.cs
// Factory-based middleware implementing IMiddleware
// Allows SCOPED dependency injection!
public class ${config.name}Middleware : IMiddleware
{`;

    if (config.injectService) {
      code += `
    private readonly ${config.serviceName} _logger;

    public ${config.name}Middleware(${config.serviceName} logger)
    {
        _logger = logger;
    }`;
    } else {
      code += `
    public ${config.name}Middleware()
    {
    }`;
    }

    code += `

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        // Before the next middleware
        ${config.beforeNext}
`;

    if (config.shortCircuit) {
      code += `
        // Short-circuit condition
        if (${config.shortCircuitCondition})
        {
            context.Response.StatusCode = 403;
            await context.Response.WriteAsync("Blocked!");
            return;
        }
`;
    }

    code += `
        await next(context);

        // After the next middleware
        ${config.afterNext}
    }
}

// Registration in Program.cs:
// 1. Register as a service (enables scoped dependencies):
builder.Services.AddScoped<${config.name}Middleware>();

// 2. Add to pipeline:
app.UseMiddleware<${config.name}Middleware>();`;

    return code;
  };

  const getGeneratedCode = (): string => {
    switch (middlewareType) {
      case 'inline':
        return generateInlineCode();
      case 'convention':
        return generateConventionCode();
      case 'factory':
        return generateFactoryCode();
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(getGeneratedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const middlewareTypes = [
    {
      id: 'inline' as MiddlewareType,
      name: 'Inline',
      icon: Zap,
      description: 'Quick & simple using app.Use()',
      level: 'beginner',
    },
    {
      id: 'convention' as MiddlewareType,
      name: 'Convention-based',
      icon: FileCode,
      description: 'Separate class with InvokeAsync',
      level: 'intermediate',
    },
    {
      id: 'factory' as MiddlewareType,
      name: 'Factory-based',
      icon: Factory,
      description: 'IMiddleware interface for scoped DI',
      level: 'advanced',
    },
  ];

  return (
    <Card className="my-4 overflow-hidden bg-gray-950 border-gray-800">
      <CardHeader className="pb-2 bg-gray-900/50">
        <CardTitle className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-purple-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Beginner Analogy */}
        {mode === 'beginner' && (
          <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-200 mb-2">🚧 Build Your Own Checkpoint</h4>
            <p className="text-sm text-gray-400">
              Custom middleware is like creating your own security checkpoint at the airport.
              You decide what to check, what to allow, and what to block!
            </p>
          </div>
        )}

        {/* Middleware Type Selector */}
        {mode !== 'beginner' && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {middlewareTypes.map(type => (
              <Button
                key={type.id}
                variant={middlewareType === type.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMiddlewareType(type.id)}
                className={cn(
                  'flex flex-col h-auto py-3 px-2',
                  middlewareType === type.id && 'bg-purple-600 hover:bg-purple-700'
                )}
              >
                <type.icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{type.name}</span>
              </Button>
            ))}
          </div>
        )}

        {/* Type Description */}
        <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            {middlewareType === 'inline' && <Zap className="h-4 w-4 text-yellow-400" />}
            {middlewareType === 'convention' && <FileCode className="h-4 w-4 text-blue-400" />}
            {middlewareType === 'factory' && <Factory className="h-4 w-4 text-purple-400" />}
            <span className="text-sm font-medium text-white">
              {middlewareTypes.find(t => t.id === middlewareType)?.name} Middleware
            </span>
            <Badge variant="outline" className="text-xs ml-2">
              {middlewareTypes.find(t => t.id === middlewareType)?.level}
            </Badge>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {middlewareTypes.find(t => t.id === middlewareType)?.description}
          </p>
        </div>

        {/* Configuration Form */}
        <div className="space-y-4 mb-4">
          {/* Middleware Name (not for inline) */}
          {middlewareType !== 'inline' && (
            <div>
              <Label className="text-xs text-gray-400">Middleware Name</Label>
              <Input
                value={config.name}
                onChange={e => updateConfig('name', e.target.value)}
                className="mt-1 bg-gray-900 border-gray-700 text-sm"
                placeholder="e.g., RequestLogging"
              />
            </div>
          )}

          {/* Before Next */}
          <div>
            <Label className="text-xs text-gray-400 flex items-center gap-1">
              <ArrowRight className="h-3 w-3 text-blue-400" />
              Code to run BEFORE next middleware
            </Label>
            <Textarea
              value={config.beforeNext}
              onChange={e => updateConfig('beforeNext', e.target.value)}
              className="mt-1 bg-gray-900 border-gray-700 text-xs font-mono h-16"
              placeholder="Console.WriteLine(...);"
            />
          </div>

          {/* After Next */}
          <div>
            <Label className="text-xs text-gray-400 flex items-center gap-1">
              <ArrowDown className="h-3 w-3 text-green-400" />
              Code to run AFTER next middleware (on response)
            </Label>
            <Textarea
              value={config.afterNext}
              onChange={e => updateConfig('afterNext', e.target.value)}
              className="mt-1 bg-gray-900 border-gray-700 text-xs font-mono h-16"
              placeholder="Console.WriteLine(...);"
            />
          </div>

          {/* Short Circuit (intermediate+) */}
          {mode !== 'beginner' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="shortCircuit"
                  checked={config.shortCircuit}
                  onChange={e => updateConfig('shortCircuit', e.target.checked)}
                  className="rounded bg-gray-900 border-gray-700"
                />
                <Label htmlFor="shortCircuit" className="text-xs text-gray-400 cursor-pointer">
                  🚫 Add short-circuit condition (block certain requests)
                </Label>
              </div>
              {config.shortCircuit && (
                <Input
                  value={config.shortCircuitCondition}
                  onChange={e => updateConfig('shortCircuitCondition', e.target.value)}
                  className="bg-gray-900 border-gray-700 text-xs font-mono"
                  placeholder='context.Request.Path.StartsWithSegments("/blocked")'
                />
              )}
            </div>
          )}

          {/* Dependency Injection (advanced) */}
          {mode === 'advanced' && middlewareType !== 'inline' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="injectService"
                  checked={config.injectService}
                  onChange={e => updateConfig('injectService', e.target.checked)}
                  className="rounded bg-gray-900 border-gray-700"
                />
                <Label htmlFor="injectService" className="text-xs text-gray-400 cursor-pointer">
                  💉 Inject a service via DI
                </Label>
              </div>
              {config.injectService && (
                <Input
                  value={config.serviceName}
                  onChange={e => updateConfig('serviceName', e.target.value)}
                  className="bg-gray-900 border-gray-700 text-xs font-mono"
                  placeholder="ILogger<MyMiddleware>"
                />
              )}
            </div>
          )}
        </div>

        {/* Flow Visualization Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFlow(!showFlow)}
          className="mb-4 text-xs"
        >
          <Play className="h-3 w-3 mr-1" />
          {showFlow ? 'Hide' : 'Show'} Request Flow
        </Button>

        {/* Flow Visualization */}
        <AnimatePresence>
          {showFlow && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="px-3 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      📥 Incoming Request
                    </div>
                  </div>
                  <ArrowDown className="h-4 w-4 text-gray-500" />
                  
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 text-center"
                  >
                    <div className="text-xs font-medium mb-1">Your Middleware</div>
                    <div className="text-xs text-gray-400">{config.beforeNext.slice(0, 30)}...</div>
                  </motion.div>
                  
                  {config.shortCircuit && (
                    <div className="flex items-center gap-4">
                      <div className="px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-xs">
                        🚫 Short-circuit
                      </div>
                      <span className="text-gray-500 text-xs">or</span>
                    </div>
                  )}
                  
                  <ArrowDown className="h-4 w-4 text-gray-500" />
                  <div className="px-3 py-1 rounded bg-gray-700 text-gray-300 text-xs">
                    await next() → Other Middleware → Endpoint
                  </div>
                  <ArrowDown className="h-4 w-4 text-gray-500" />
                  
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-center"
                  >
                    <div className="text-xs font-medium mb-1">Your Middleware (Response)</div>
                    <div className="text-xs text-gray-400">{config.afterNext.slice(0, 30)}...</div>
                  </motion.div>
                  
                  <ArrowDown className="h-4 w-4 text-gray-500" />
                  <div className="flex items-center gap-2 text-sm">
                    <div className="px-3 py-1 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                      📤 Outgoing Response
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generated Code */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium text-gray-200">Generated Code</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="text-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 mr-1 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-xs font-mono text-gray-300">
            {getGeneratedCode()}
          </pre>
        </div>

        {/* Tips for advanced mode */}
        {mode === 'advanced' && (
          <div className="mt-4 bg-gray-800/50 rounded-lg p-3">
            <h4 className="text-xs font-medium text-amber-400 mb-2">💡 Pro Tips</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Use <code className="text-cyan-400">IMiddleware</code> when you need <strong>scoped</strong> dependencies</li>
              <li>• Convention-based middleware only supports <strong>singleton</strong> dependencies</li>
              <li>• Always call <code className="text-cyan-400">await next(context)</code> unless short-circuiting</li>
              <li>• Register factory middleware with <code className="text-cyan-400">AddScoped</code> or <code className="text-cyan-400">AddTransient</code></li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CustomMiddlewareBuilder;
