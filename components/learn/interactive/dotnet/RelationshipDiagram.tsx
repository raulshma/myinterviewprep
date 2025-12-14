'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, ArrowRight, RotateCcw, Users, FileText, MessageSquare, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type RelationshipType = 'one-to-one' | 'one-to-many' | 'many-to-many';

export interface RelationshipDiagramProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
  title?: string;
  initialType?: RelationshipType;
}

interface EntityConfig {
  name: string;
  icon: React.ReactNode;
  properties: string[];
  foreignKey?: string;
}

const relationshipData: Record<RelationshipType, { left: EntityConfig; right: EntityConfig; junction?: EntityConfig; description: string; analogy: string }> = {
  'one-to-one': {
    left: { name: 'Person', icon: <User className="h-4 w-4" />, properties: ['Id', 'Name', 'Email'] },
    right: { name: 'Passport', icon: <FileText className="h-4 w-4" />, properties: ['Id', 'Number', 'Country', 'PersonId'], foreignKey: 'PersonId' },
    description: 'Each Person has exactly one Passport, and each Passport belongs to exactly one Person.',
    analogy: '🧑 One person = One passport. Just like how you can only have one valid passport at a time!',
  },
  'one-to-many': {
    left: { name: 'Blog', icon: <FileText className="h-4 w-4" />, properties: ['Id', 'Title', 'Url'] },
    right: { name: 'Post', icon: <MessageSquare className="h-4 w-4" />, properties: ['Id', 'Title', 'Content', 'BlogId'], foreignKey: 'BlogId' },
    description: 'One Blog can have many Posts, but each Post belongs to only one Blog.',
    analogy: '📚 Think of a blog like a folder - it can hold many posts inside, but each post lives in just one folder!',
  },
  'many-to-many': {
    left: { name: 'Student', icon: <User className="h-4 w-4" />, properties: ['Id', 'Name', 'Email'] },
    right: { name: 'Course', icon: <FileText className="h-4 w-4" />, properties: ['Id', 'Title', 'Credits'] },
    junction: { name: 'Enrollment', icon: <Link2 className="h-4 w-4" />, properties: ['StudentId', 'CourseId', 'EnrolledDate'] },
    description: 'Students can enroll in many Courses, and each Course can have many Students.',
    analogy: '🎓 Like classes at school - you take multiple courses, and each course has multiple students!',
  },
};

export function RelationshipDiagram({
  mode = 'beginner',
  title = 'Entity Relationships',
  initialType = 'one-to-many',
}: RelationshipDiagramProps) {
  const [relationshipType, setRelationshipType] = useState<RelationshipType>(initialType);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const config = relationshipData[relationshipType];

  const animateRelationship = useCallback(async () => {
    setIsAnimating(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsAnimating(false);
    setShowCode(true);
  }, []);

  const reset = useCallback(() => {
    setIsAnimating(false);
    setShowCode(false);
  }, []);

  const getCodeExample = () => {
    switch (relationshipType) {
      case 'one-to-one':
        return `public class Person
{
    public int Id { get; set; }
    public string Name { get; set; }
    
    // Navigation property
    public Passport Passport { get; set; }
}

public class Passport
{
    public int Id { get; set; }
    public string Number { get; set; }
    
    // Foreign key
    public int PersonId { get; set; }
    public Person Person { get; set; }
}`;
      case 'one-to-many':
        return `public class Blog
{
    public int Id { get; set; }
    public string Title { get; set; }
    
    // Collection navigation
    public ICollection<Post> Posts { get; set; }
}

public class Post
{
    public int Id { get; set; }
    public string Title { get; set; }
    
    // Foreign key
    public int BlogId { get; set; }
    public Blog Blog { get; set; }
}`;
      case 'many-to-many':
        return `public class Student
{
    public int Id { get; set; }
    public string Name { get; set; }
    
    // Many-to-many
    public ICollection<Course> Courses { get; set; }
}

public class Course
{
    public int Id { get; set; }
    public string Title { get; set; }
    
    // Many-to-many
    public ICollection<Student> Students { get; set; }
}`;
    }
  };

  const renderEntity = (entity: EntityConfig, side: 'left' | 'right' | 'junction') => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'p-4 rounded-lg border-2 bg-gray-900/50 min-w-[140px]',
        side === 'left' && 'border-blue-500',
        side === 'right' && 'border-green-500',
        side === 'junction' && 'border-purple-500'
      )}
    >
      <div className={cn(
        'flex items-center gap-2 mb-3 pb-2 border-b',
        side === 'left' && 'text-blue-400 border-blue-700',
        side === 'right' && 'text-green-400 border-green-700',
        side === 'junction' && 'text-purple-400 border-purple-700'
      )}>
        {entity.icon}
        <span className="font-mono text-sm font-medium">{entity.name}</span>
      </div>
      <div className="space-y-1">
        {entity.properties.map(prop => (
          <div key={prop} className={cn(
            'text-xs font-mono',
            entity.foreignKey === prop ? 'text-yellow-400' : 'text-gray-400'
          )}>
            {prop}
            {entity.foreignKey === prop && (
              <span className="ml-1 text-yellow-600">(FK)</span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderConnectionLine = () => {
    const labels: Record<RelationshipType, { left: string; right: string }> = {
      'one-to-one': { left: '1', right: '1' },
      'one-to-many': { left: '1', right: '*' },
      'many-to-many': { left: '*', right: '*' },
    };

    return (
      <div className="flex items-center mx-4">
        <span className="text-lg font-bold text-blue-400 mr-2">{labels[relationshipType].left}</span>
        <motion.div
          className="flex items-center"
          animate={isAnimating ? {
            scale: [1, 1.1, 1],
          } : {}}
          transition={{ duration: 1, repeat: isAnimating ? Infinity : 0 }}
        >
          <div className="w-8 h-0.5 bg-gray-500" />
          <motion.div
            animate={isAnimating ? { x: [0, 20, 0] } : {}}
            transition={{ duration: 1, repeat: isAnimating ? Infinity : 0 }}
          >
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </motion.div>
          <div className="w-8 h-0.5 bg-gray-500" />
        </motion.div>
        <span className="text-lg font-bold text-green-400 ml-2">{labels[relationshipType].right}</span>
      </div>
    );
  };

  return (
    <Card className="my-4 overflow-hidden bg-gray-950 border-gray-800">
      <CardHeader className="pb-2 flex flex-row items-center justify-between bg-gray-900/50">
        <CardTitle className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <Link2 className="h-4 w-4 text-cyan-400" />
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          <select
            value={relationshipType}
            onChange={(e) => {
              setRelationshipType(e.target.value as RelationshipType);
              reset();
            }}
            className="bg-gray-800 text-gray-300 text-xs rounded px-2 py-1 border border-gray-700"
          >
            <option value="one-to-one">1:1 (One-to-One)</option>
            <option value="one-to-many">1:N (One-to-Many)</option>
            <option value="many-to-many">N:N (Many-to-Many)</option>
          </select>
          <Button variant="ghost" size="sm" onClick={reset} className="text-gray-400 hover:text-white">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Beginner Analogy */}
        {mode === 'beginner' && (
          <div className="bg-cyan-900/20 border border-cyan-700 rounded-lg p-4">
            <h4 className="font-medium text-cyan-300 mb-2">🔗 Understanding Relationships</h4>
            <p className="text-sm text-gray-400">{config.analogy}</p>
          </div>
        )}

        {/* Description */}
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
          <p className="text-sm text-gray-300">{config.description}</p>
        </div>

        {/* Entity Diagram */}
        <div className="flex items-center justify-center py-4">
          {renderEntity(config.left, 'left')}
          
          {config.junction ? (
            <>
              {renderConnectionLine()}
              {renderEntity(config.junction, 'junction')}
              {renderConnectionLine()}
            </>
          ) : (
            renderConnectionLine()
          )}
          
          {renderEntity(config.right, 'right')}
        </div>

        {/* Animate Button */}
        {!showCode && (
          <div className="text-center">
            <Button onClick={animateRelationship} disabled={isAnimating} className="bg-cyan-600 hover:bg-cyan-700">
              {isAnimating ? 'Connecting...' : 'See How They Connect'}
            </Button>
          </div>
        )}

        {/* Code Example */}
        <AnimatePresence>
          {showCode && mode !== 'beginner' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 rounded-lg border border-gray-700"
            >
              <div className="px-3 py-2 bg-gray-800 border-b border-gray-700 text-xs text-gray-400">
                Entity Classes (C#)
              </div>
              <pre className="p-3 text-xs font-mono text-gray-300 overflow-x-auto">
                {getCodeExample()}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced: Fluent API Configuration */}
        {mode === 'advanced' && showCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-900 rounded-lg border border-gray-700"
          >
            <div className="px-3 py-2 bg-gray-800 border-b border-gray-700 text-xs text-gray-400">
              Fluent API Configuration (OnModelCreating)
            </div>
            <pre className="p-3 text-xs font-mono text-yellow-400 overflow-x-auto">
{relationshipType === 'one-to-one' 
  ? `modelBuilder.Entity<Person>()
    .HasOne(p => p.Passport)
    .WithOne(p => p.Person)
    .HasForeignKey<Passport>(p => p.PersonId);`
  : relationshipType === 'one-to-many'
  ? `modelBuilder.Entity<Blog>()
    .HasMany(b => b.Posts)
    .WithOne(p => p.Blog)
    .HasForeignKey(p => p.BlogId);`
  : `modelBuilder.Entity<Student>()
    .HasMany(s => s.Courses)
    .WithMany(c => c.Students)
    .UsingEntity<Enrollment>();`}
            </pre>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

export default RelationshipDiagram;
