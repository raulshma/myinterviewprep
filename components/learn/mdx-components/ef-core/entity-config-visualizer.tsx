'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings2, 
  Code2, 
  FileCode, 
  ArrowRight,
  CheckCircle2,
  Layers,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ConfigMethod = 'convention' | 'annotation' | 'fluent';

interface ConfigExample {
  method: ConfigMethod;
  title: string;
  description: string;
  code: string;
  result: string;
  priority: number;
}

const configExamples: ConfigExample[] = [
  {
    method: 'convention',
    title: 'Convention',
    description: 'EF Core automatically detects patterns in your code',
    code: `public class Product
{
    public int Id { get; set; }  // Auto-detected as PK
    public string Name { get; set; }
    public decimal Price { get; set; }
}`,
    result: 'Id → Primary Key (auto-increment)\nName → nvarchar(max)\nPrice → decimal(18,2)',
    priority: 1,
  },
  {
    method: 'annotation',
    title: 'Data Annotation',
    description: 'Attributes on properties override conventions',
    code: `public class Product
{
    [Key]
    public int ProductId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; }
    
    [Column(TypeName = "decimal(10,2)")]
    public decimal Price { get; set; }
}`,
    result: 'ProductId → Primary Key\nName → nvarchar(100) NOT NULL\nPrice → decimal(10,2)',
    priority: 2,
  },
  {
    method: 'fluent',
    title: 'Fluent API',
    description: 'OnModelCreating configuration has highest priority',
    code: `protected override void OnModelCreating(
    ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Product>(entity =>
    {
        entity.HasKey(p => p.ProductId);
        entity.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(100);
        entity.Property(p => p.Price)
            .HasColumnType("decimal(10,2)");
    });
}`,
    result: 'ProductId → Primary Key\nName → nvarchar(100) NOT NULL\nPrice → decimal(10,2)',
    priority: 3,
  },
];

/**
 * EntityConfigVisualizer Component
 * Shows the three ways to configure entities and their priority
 */
export function EntityConfigVisualizer() {
  const [selectedMethod, setSelectedMethod] = useState<ConfigMethod>('convention');
  const [showPriority, setShowPriority] = useState(false);

  const currentExample = configExamples.find(e => e.method === selectedMethod)!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6 rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-secondary/30 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Entity Configuration Methods
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowPriority(!showPriority)}
          className="text-xs"
        >
          {showPriority ? 'Hide' : 'Show'} Priority
        </Button>
      </div>

      {/* Method Selector */}
      <div className="p-4 border-b border-border">
        <div className="flex gap-2">
          {configExamples.map((example) => (
            <button
              key={example.method}
              onClick={() => setSelectedMethod(example.method)}
              className={cn(
                'flex-1 p-3 rounded-lg border-2 transition-all text-left',
                selectedMethod === example.method
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                {example.method === 'convention' && <Layers className="w-4 h-4 text-blue-500" />}
                {example.method === 'annotation' && <FileCode className="w-4 h-4 text-green-500" />}
                {example.method === 'fluent' && <Code2 className="w-4 h-4 text-purple-500" />}
                <span className="text-sm font-medium">{example.title}</span>
                {showPriority && (
                  <span className={cn(
                    'ml-auto text-xs px-1.5 py-0.5 rounded',
                    example.priority === 1 && 'bg-blue-500/20 text-blue-500',
                    example.priority === 2 && 'bg-green-500/20 text-green-500',
                    example.priority === 3 && 'bg-purple-500/20 text-purple-500'
                  )}>
                    Priority {example.priority}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{example.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Code and Result */}
      <div className="grid md:grid-cols-2 gap-0">
        {/* Code */}
        <div className="p-4 border-r border-border bg-zinc-950">
          <div className="flex items-center gap-2 mb-3">
            <Code2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">C# Code</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.pre
              key={selectedMethod}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="text-xs font-mono text-zinc-300 whitespace-pre-wrap"
            >
              {currentExample.code}
            </motion.pre>
          </AnimatePresence>
        </div>

        {/* Result */}
        <div className="p-4 bg-secondary/20">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Database Result</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMethod}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-2"
            >
              {currentExample.result.split('\n').map((line, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  <code className="text-foreground">{line}</code>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Priority Explanation */}
      {showPriority && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 py-3 border-t border-border bg-secondary/30"
        >
          <div className="flex items-center gap-4 text-xs">
            <span className="text-muted-foreground">Override Order:</span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-500">Convention</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
              <span className="px-2 py-1 rounded bg-green-500/20 text-green-500">Data Annotations</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
              <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-500">Fluent API</span>
            </div>
            <span className="text-muted-foreground ml-auto">Fluent API wins!</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default EntityConfigVisualizer;
