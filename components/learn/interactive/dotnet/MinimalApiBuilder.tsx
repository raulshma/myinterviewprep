'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Server, Code2, Plus, Trash2, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface MinimalEndpoint {
  method: HttpMethod;
  route: string;
  handler: string;
  description: string;
}

export interface MinimalApiBuilderProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
  title?: string;
}

const methodColors: Record<HttpMethod, string> = {
  GET: 'bg-green-500/20 text-green-400 border-green-500/50',
  POST: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  PUT: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  DELETE: 'bg-red-500/20 text-red-400 border-red-500/50',
};

const defaultEndpoints: MinimalEndpoint[] = [
  { method: 'GET', route: '/api/products', handler: '() => products', description: 'List all' },
  { method: 'GET', route: '/api/products/{id}', handler: '(int id) => product', description: 'Get by ID' },
  { method: 'POST', route: '/api/products', handler: '(Product p) => Created()', description: 'Create' },
  { method: 'DELETE', route: '/api/products/{id}', handler: '(int id) => NoContent()', description: 'Delete' },
];

const controllerCode = `[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _service;
    
    public ProductsController(IProductService service)
    {
        _service = service;
    }
    
    [HttpGet]
    public ActionResult<List<Product>> GetAll()
        => Ok(_service.GetAll());
    
    [HttpGet("{id}")]
    public ActionResult<Product> GetById(int id)
        => _service.GetById(id) is Product p 
            ? Ok(p) : NotFound();
    
    [HttpPost]
    public ActionResult Create(Product product)
    {
        _service.Add(product);
        return Created($"/api/products/{product.Id}", product);
    }
    
    [HttpDelete("{id}")]
    public ActionResult Delete(int id)
    {
        _service.Delete(id);
        return NoContent();
    }
}`;

const minimalCode = `var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<IProductService, ProductService>();

var app = builder.Build();

var products = app.MapGroup("/api/products");

products.MapGet("/", (IProductService service) 
    => service.GetAll());

products.MapGet("/{id}", (int id, IProductService service) 
    => service.GetById(id) is Product p 
        ? Results.Ok(p) : Results.NotFound());

products.MapPost("/", (Product product, IProductService service) =>
{
    service.Add(product);
    return Results.Created($"/api/products/{product.Id}", product);
});

products.MapDelete("/{id}", (int id, IProductService service) =>
{
    service.Delete(id);
    return Results.NoContent();
});

app.Run();`;

type ViewMode = 'minimal' | 'controller' | 'comparison';

export function MinimalApiBuilder({
  mode = 'beginner',
  title = 'Minimal APIs vs Controllers',
}: MinimalApiBuilderProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('comparison');
  const [endpoints, setEndpoints] = useState<MinimalEndpoint[]>(defaultEndpoints);
  const [activeEndpoint, setActiveEndpoint] = useState(0);

  const addEndpoint = () => {
    setEndpoints([...endpoints, {
      method: 'GET',
      route: '/api/new',
      handler: '() => "Hello"',
      description: 'New endpoint',
    }]);
  };

  const removeEndpoint = (index: number) => {
    setEndpoints(endpoints.filter((_, i) => i !== index));
  };

  const generateMinimalCode = () => {
    return endpoints.map(ep => 
      `app.Map${ep.method.charAt(0) + ep.method.slice(1).toLowerCase()}("${ep.route}", ${ep.handler});`
    ).join('\n');
  };

  return (
    <Card className="my-4 overflow-hidden bg-gray-950 border-gray-800">
      <CardHeader className="pb-2 bg-gray-900/50">
        <CardTitle className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('minimal')}
            className={cn(
              'text-xs border',
              viewMode === 'minimal'
                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                : 'text-gray-400 border-gray-700'
            )}
          >
            <Zap className="h-3 w-3 mr-1" />
            Minimal APIs
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('controller')}
            className={cn(
              'text-xs border',
              viewMode === 'controller'
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                : 'text-gray-400 border-gray-700'
            )}
          >
            <Server className="h-3 w-3 mr-1" />
            Controllers
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('comparison')}
            className={cn(
              'text-xs border',
              viewMode === 'comparison'
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                : 'text-gray-400 border-gray-700'
            )}
          >
            <ArrowLeftRight className="h-3 w-3 mr-1" />
            Compare
          </Button>
        </div>

        {/* Comparison View */}
        <AnimatePresence mode="wait">
          {viewMode === 'comparison' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-4"
            >
              {/* Minimal APIs Side */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-yellow-400">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">Minimal APIs</span>
                </div>
                <div className="space-y-1 text-xs text-gray-400">
                  <div className="flex items-center gap-1">✓ Less boilerplate</div>
                  <div className="flex items-center gap-1">✓ Faster startup</div>
                  <div className="flex items-center gap-1">✓ Functional style</div>
                  <div className="flex items-center gap-1">✓ Great for microservices</div>
                </div>
                <pre className="bg-black/50 rounded-lg p-2 text-xs font-mono overflow-x-auto max-h-48">
                  <code className="text-yellow-400">
                    {`app.MapGet("/api/products", 
    () => products);

app.MapGet("/api/products/{id}", 
    (int id) => GetById(id));`}
                  </code>
                </pre>
              </div>

              {/* Controllers Side */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-400">
                  <Server className="h-4 w-4" />
                  <span className="text-sm font-medium">Controllers</span>
                </div>
                <div className="space-y-1 text-xs text-gray-400">
                  <div className="flex items-center gap-1">✓ More structure</div>
                  <div className="flex items-center gap-1">✓ Built-in filters</div>
                  <div className="flex items-center gap-1">✓ OOP patterns</div>
                  <div className="flex items-center gap-1">✓ Better for large APIs</div>
                </div>
                <pre className="bg-black/50 rounded-lg p-2 text-xs font-mono overflow-x-auto max-h-48">
                  <code className="text-blue-400">
                    {`[HttpGet]
public ActionResult<List<Product>> 
    GetAll() => Ok(_service.GetAll());

[HttpGet("{id}")]
public ActionResult<Product> 
    GetById(int id) => ...;`}
                  </code>
                </pre>
              </div>
            </motion.div>
          )}

          {viewMode === 'minimal' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {/* Endpoint Builder */}
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Endpoints</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addEndpoint}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>

              <div className="space-y-1">
                {endpoints.map((ep, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all',
                      activeEndpoint === index
                        ? 'bg-gray-800 border-yellow-500/50'
                        : 'bg-gray-800/30 border-gray-700 hover:border-gray-600'
                    )}
                    onClick={() => setActiveEndpoint(index)}
                  >
                    <span className={cn('px-2 py-0.5 rounded text-xs font-bold border', methodColors[ep.method])}>
                      {ep.method}
                    </span>
                    <code className="flex-1 text-xs font-mono text-gray-300">{ep.route}</code>
                    <span className="text-xs text-gray-500">{ep.description}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); removeEndpoint(index); }}
                      className="h-6 w-6 p-0 text-gray-500 hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1">
                  <Code2 className="h-3 w-3" /> Generated Code
                </p>
                <pre className="bg-black/50 rounded-lg p-3 text-xs font-mono overflow-x-auto">
                  <code className="text-yellow-400">
                    {`var app = WebApplication.CreateBuilder(args).Build();

${generateMinimalCode()}

app.Run();`}
                  </code>
                </pre>
              </div>
            </motion.div>
          )}

          {viewMode === 'controller' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1">
                <Code2 className="h-3 w-3" /> Controller Implementation
              </p>
              <pre className="bg-black/50 rounded-lg p-3 text-xs font-mono overflow-x-auto max-h-80">
                <code>
                  {controllerCode.split('\n').map((line, i) => (
                    <div key={i}>
                      {line.includes('[Http') || line.includes('[Api') || line.includes('[Route') ? (
                        <span className="text-purple-400">{line}</span>
                      ) : line.includes('public') || line.includes('private') || line.includes('return') || line.includes('var') || line.includes('is') ? (
                        <span>
                          {line.split(/\b(public|private|return|var|is|null)\b/).map((part, j) => 
                            ['public', 'private', 'return', 'var', 'is', 'null'].includes(part)
                              ? <span key={j} className="text-purple-400">{part}</span>
                              : <span key={j} className="text-gray-300">{part}</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-gray-300">{line}</span>
                      )}
                    </div>
                  ))}
                </code>
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Beginner Tip */}
        {mode === 'beginner' && (
          <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
            <p className="text-xs text-yellow-300">
              <strong>🍔 Fast Food vs Restaurant:</strong> Minimal APIs are like a food truck - quick setup, less ceremony. 
              Controllers are like a full restaurant - more structure, better for complex menus!
            </p>
          </div>
        )}

        {/* When to Use (Intermediate/Advanced) */}
        {mode !== 'beginner' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <p className="text-xs font-medium text-yellow-400 mb-2">Use Minimal APIs when:</p>
              <ul className="text-xs text-yellow-300/80 space-y-1">
                <li>• Simple CRUD endpoints</li>
                <li>• Microservices</li>
                <li>• Prototype/POC</li>
                <li>• Lambda-style handlers</li>
              </ul>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <p className="text-xs font-medium text-blue-400 mb-2">Use Controllers when:</p>
              <ul className="text-xs text-blue-300/80 space-y-1">
                <li>• Complex business logic</li>
                <li>• Need action filters</li>
                <li>• Large API surface</li>
                <li>• Team prefers OOP</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MinimalApiBuilder;
