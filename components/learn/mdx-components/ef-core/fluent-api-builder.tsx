'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Workflow, 
  Plus, 
  X, 
  Code2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FluentMethod {
  id: string;
  name: string;
  description: string;
  code: string;
  category: 'property' | 'entity' | 'relationship';
}

const fluentMethods: FluentMethod[] = [
  { id: 'haskey', name: 'HasKey', description: 'Configure primary key', code: '.HasKey(e => e.Id)', category: 'entity' },
  { id: 'isrequired', name: 'IsRequired', description: 'Mark as NOT NULL', code: '.IsRequired()', category: 'property' },
  { id: 'hasmaxlength', name: 'HasMaxLength', description: 'Set max string length', code: '.HasMaxLength(100)', category: 'property' },
  { id: 'hascolumnname', name: 'HasColumnName', description: 'Custom column name', code: '.HasColumnName("ProductName")', category: 'property' },
  { id: 'hascolumntype', name: 'HasColumnType', description: 'Specific SQL type', code: '.HasColumnType("decimal(10,2)")', category: 'property' },
  { id: 'hasdefaultvalue', name: 'HasDefaultValue', description: 'Default value', code: '.HasDefaultValue(0)', category: 'property' },
  { id: 'totable', name: 'ToTable', description: 'Custom table name', code: '.ToTable("Products")', category: 'entity' },
  { id: 'hasindex', name: 'HasIndex', description: 'Create index', code: '.HasIndex(e => e.Name)', category: 'entity' },
  { id: 'isunique', name: 'IsUnique', description: 'Unique constraint', code: '.IsUnique()', category: 'entity' },
  { id: 'ignore', name: 'Ignore', description: 'Exclude property', code: '.Ignore(e => e.TempData)', category: 'entity' },
];

/**
 * FluentApiBuilder Component
 * Interactive tool to build Fluent API configurations
 */
export function FluentApiBuilder() {
  const [selectedMethods, setSelectedMethods] = useState<string[]>(['haskey', 'isrequired']);
  const [entityName, setEntityName] = useState('Product');

  const addMethod = useCallback((id: string) => {
    if (!selectedMethods.includes(id)) {
      setSelectedMethods(prev => [...prev, id]);
    }
  }, [selectedMethods]);

  const removeMethod = useCallback((id: string) => {
    setSelectedMethods(prev => prev.filter(m => m !== id));
  }, []);

  const generateCode = () => {
    const entityMethods = selectedMethods
      .map(id => fluentMethods.find(m => m.id === id))
      .filter(m => m?.category === 'entity');
    
    const propertyMethods = selectedMethods
      .map(id => fluentMethods.find(m => m.id === id))
      .filter(m => m?.category === 'property');

    let code = `protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<${entityName}>(entity =>
    {`;

    entityMethods.forEach(method => {
      if (method) {
        code += `\n        entity${method.code};`;
      }
    });

    if (propertyMethods.length > 0) {
      code += `\n\n        entity.Property(e => e.Name)`;
      propertyMethods.forEach((method, i) => {
        if (method) {
          code += `\n            ${method.code}`;
          if (i < propertyMethods.length - 1) {
            // No semicolon for chained methods
          }
        }
      });
      code += ';';
    }

    code += `\n    });
}`;

    return code;
  };

  const categoryColors = {
    property: 'bg-green-500/20 text-green-500 border-green-500/30',
    entity: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    relationship: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6 rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-secondary/30 border-b border-border flex items-center gap-2">
        <Workflow className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">
          Fluent API Builder
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          Build configurations interactively
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-0">
        {/* Method Palette */}
        <div className="p-4 border-r border-border">
          <h4 className="text-xs font-medium text-muted-foreground mb-3">Fluent API Methods</h4>
          
          {/* Category Legend */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">Entity-level</span>
            <span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-500">Property-level</span>
          </div>

          <div className="space-y-4">
            {/* Entity Methods */}
            <div>
              <h5 className="text-xs text-muted-foreground mb-2">Entity Configuration</h5>
              <div className="flex flex-wrap gap-2">
                {fluentMethods.filter(m => m.category === 'entity').map((method) => {
                  const isSelected = selectedMethods.includes(method.id);
                  return (
                    <button
                      key={method.id}
                      onClick={() => isSelected ? removeMethod(method.id) : addMethod(method.id)}
                      className={cn(
                        'px-2 py-1 rounded border text-xs font-mono transition-all',
                        isSelected 
                          ? 'bg-primary/20 border-primary text-primary' 
                          : categoryColors[method.category]
                      )}
                      title={method.description}
                    >
                      {method.name}()
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Property Methods */}
            <div>
              <h5 className="text-xs text-muted-foreground mb-2">Property Configuration</h5>
              <div className="flex flex-wrap gap-2">
                {fluentMethods.filter(m => m.category === 'property').map((method) => {
                  const isSelected = selectedMethods.includes(method.id);
                  return (
                    <button
                      key={method.id}
                      onClick={() => isSelected ? removeMethod(method.id) : addMethod(method.id)}
                      className={cn(
                        'px-2 py-1 rounded border text-xs font-mono transition-all',
                        isSelected 
                          ? 'bg-primary/20 border-primary text-primary' 
                          : categoryColors[method.category]
                      )}
                      title={method.description}
                    >
                      {method.name}()
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Method Chain Preview */}
          {selectedMethods.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Method Chain</h4>
              <div className="flex flex-wrap items-center gap-1">
                {selectedMethods.map((id, i) => {
                  const method = fluentMethods.find(m => m.id === id)!;
                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center"
                    >
                      {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground mx-1" />}
                      <span className={cn(
                        'px-2 py-0.5 rounded text-xs font-mono',
                        categoryColors[method.category]
                      )}>
                        {method.name}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Generated Code */}
        <div className="p-4 bg-zinc-950">
          <div className="flex items-center gap-2 mb-3">
            <Code2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Generated Fluent API</span>
          </div>
          <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap overflow-x-auto">
            {generateCode()}
          </pre>
        </div>
      </div>

      {/* Benefits */}
      <div className="px-4 py-3 border-t border-border bg-secondary/20">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Why Fluent API?</strong> Keeps entity classes clean, 
            supports all configuration options, and has the highest priority over conventions and annotations.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default FluentApiBuilder;
