'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tag, 
  Plus, 
  X, 
  CheckCircle2,
  AlertCircle,
  Code2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Annotation {
  id: string;
  name: string;
  description: string;
  example: string;
  category: 'validation' | 'schema' | 'key' | 'relationship';
}

const availableAnnotations: Annotation[] = [
  { id: 'key', name: '[Key]', description: 'Marks property as primary key', example: '[Key]', category: 'key' },
  { id: 'required', name: '[Required]', description: 'Property cannot be null', example: '[Required]', category: 'validation' },
  { id: 'maxlength', name: '[MaxLength(n)]', description: 'Maximum string length', example: '[MaxLength(100)]', category: 'validation' },
  { id: 'stringlength', name: '[StringLength(n)]', description: 'String length constraint', example: '[StringLength(50)]', category: 'validation' },
  { id: 'column', name: '[Column]', description: 'Custom column name/type', example: '[Column("ProductName")]', category: 'schema' },
  { id: 'table', name: '[Table]', description: 'Custom table name', example: '[Table("Products")]', category: 'schema' },
  { id: 'notmapped', name: '[NotMapped]', description: 'Exclude from database', example: '[NotMapped]', category: 'schema' },
  { id: 'foreignkey', name: '[ForeignKey]', description: 'Foreign key relationship', example: '[ForeignKey("CategoryId")]', category: 'relationship' },
  { id: 'index', name: '[Index]', description: 'Create database index', example: '[Index]', category: 'schema' },
  { id: 'range', name: '[Range]', description: 'Value range constraint', example: '[Range(0, 1000)]', category: 'validation' },
];

/**
 * AnnotationBuilder Component
 * Interactive tool to explore and build Data Annotations
 */
export function AnnotationBuilder() {
  const [selectedAnnotations, setSelectedAnnotations] = useState<string[]>([]);
  const [propertyName, setPropertyName] = useState('Price');
  const [propertyType, setPropertyType] = useState('decimal');

  const addAnnotation = useCallback((id: string) => {
    if (!selectedAnnotations.includes(id)) {
      setSelectedAnnotations(prev => [...prev, id]);
    }
  }, [selectedAnnotations]);

  const removeAnnotation = useCallback((id: string) => {
    setSelectedAnnotations(prev => prev.filter(a => a !== id));
  }, []);

  const generateCode = () => {
    const annotations = selectedAnnotations
      .map(id => availableAnnotations.find(a => a.id === id)?.example)
      .filter(Boolean);
    
    const annotationLines = annotations.map(a => `    ${a}`).join('\n');
    return `public class Product
{
    public int Id { get; set; }
    
${annotationLines}
    public ${propertyType} ${propertyName} { get; set; }
}`;
  };

  const categoryColors = {
    validation: 'bg-green-500/20 text-green-500 border-green-500/30',
    schema: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    key: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
    relationship: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6 rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-secondary/30 border-b border-border flex items-center gap-2">
        <Tag className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">
          Data Annotation Builder
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          Click annotations to add them
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-0">
        {/* Annotation Palette */}
        <div className="p-4 border-r border-border">
          <h4 className="text-xs font-medium text-muted-foreground mb-3">Available Annotations</h4>
          
          {/* Category Legend */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-500">Validation</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">Schema</span>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-500">Key</span>
            <span className="text-xs px-2 py-0.5 rounded bg-orange-500/10 text-orange-500">Relationship</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableAnnotations.map((annotation) => {
              const isSelected = selectedAnnotations.includes(annotation.id);
              return (
                <button
                  key={annotation.id}
                  onClick={() => isSelected ? removeAnnotation(annotation.id) : addAnnotation(annotation.id)}
                  className={cn(
                    'px-2 py-1 rounded border text-xs font-mono transition-all',
                    isSelected 
                      ? 'bg-primary/20 border-primary text-primary' 
                      : categoryColors[annotation.category]
                  )}
                  title={annotation.description}
                >
                  {isSelected && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                  {annotation.name}
                </button>
              );
            })}
          </div>

          {/* Selected Annotations */}
          {selectedAnnotations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Selected ({selectedAnnotations.length})</h4>
              <div className="space-y-1">
                {selectedAnnotations.map(id => {
                  const annotation = availableAnnotations.find(a => a.id === id)!;
                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-2 rounded bg-secondary/30"
                    >
                      <div>
                        <code className="text-xs text-primary">{annotation.example}</code>
                        <p className="text-xs text-muted-foreground">{annotation.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAnnotation(id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
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
            <span className="text-xs text-muted-foreground">Generated Code</span>
          </div>
          <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap">
            {generateCode()}
          </pre>
        </div>
      </div>

      {/* Tips */}
      <div className="px-4 py-3 border-t border-border bg-secondary/20">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> Data Annotations are great for simple configurations. 
            For complex scenarios or to keep entities clean, use Fluent API instead.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default AnnotationBuilder;
