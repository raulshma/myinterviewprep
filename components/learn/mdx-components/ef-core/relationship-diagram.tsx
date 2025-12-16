'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeftRight,
  Key,
  Link2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AnimatedControls,
  type AnimationSpeed,
  speedMultipliers,
} from '@/components/learn/shared/animated-controls';

type RelationshipType = 'one-to-one' | 'one-to-many' | 'many-to-many';

interface EntityDefinition {
  name: string;
  properties: string[];
}

interface RelationshipDiagramProps {
  type: RelationshipType;
  entities: {
    principal: EntityDefinition;
    dependent: EntityDefinition;
  };
  showNavigation?: boolean;
  showForeignKey?: boolean;
}

/**
 * RelationshipDiagram Component
 * Interactive diagram showing entity relationships with navigation properties
 * Validates: Requirements 9.2
 */
export function RelationshipDiagram({ 
  type, 
  entities, 
  showNavigation = true,
  showForeignKey = true 
}: RelationshipDiagramProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<AnimationSpeed>('normal');
  const [highlightNav, setHighlightNav] = useState(false);
  const multiplier = speedMultipliers[speed];

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setHighlightNav((prev) => !prev);
    }, 2000 * multiplier);

    return () => clearInterval(interval);
  }, [isPlaying, multiplier]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleSpeedChange = useCallback((newSpeed: AnimationSpeed) => {
    setSpeed(newSpeed);
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setHighlightNav(false);
    setTimeout(() => setIsPlaying(true), 100);
  }, []);

  const relationshipInfo = getRelationshipInfo(type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6 rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-secondary/30 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {relationshipInfo.title}
          </span>
        </div>
        <span className={cn(
          'text-xs px-2 py-0.5 rounded font-mono',
          relationshipInfo.badgeClass
        )}>
          {type}
        </span>
      </div>

      {/* Diagram */}
      <div className="p-6">
        <div className="flex items-start justify-center gap-8 md:gap-16">
          {/* Principal Entity */}
          <EntityBox
            entity={entities.principal}
            label="Principal"
            isPrincipal
            showForeignKey={false}
            highlightNav={highlightNav && showNavigation}
            navProperty={showNavigation ? getNavProperty(type, 'principal', entities.dependent.name) : undefined}
          />

          {/* Relationship Arrow */}
          <div className="flex flex-col items-center justify-center pt-12 gap-2">
            <RelationshipArrow 
              type={type} 
              isPlaying={isPlaying} 
              multiplier={multiplier}
              highlightNav={highlightNav}
            />
            <span className="text-xs text-muted-foreground mt-2">
              {relationshipInfo.description}
            </span>
          </div>

          {/* Dependent Entity */}
          <EntityBox
            entity={entities.dependent}
            label="Dependent"
            isPrincipal={false}
            showForeignKey={showForeignKey}
            foreignKeyName={`${entities.principal.name}Id`}
            highlightNav={highlightNav && showNavigation}
            navProperty={showNavigation ? getNavProperty(type, 'dependent', entities.principal.name) : undefined}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-border bg-secondary/20">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-muted-foreground">Primary Key</span>
          </div>
          {showForeignKey && (
            <div className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-muted-foreground">Foreign Key</span>
            </div>
          )}
          {showNavigation && (
            <div className="flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-green-500" />
              <span className="text-muted-foreground">Navigation Property</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <AnimatedControls
        isPlaying={isPlaying}
        speed={speed}
        onPlayPause={handlePlayPause}
        onSpeedChange={handleSpeedChange}
        onReset={handleReset}
        label="Relationship visualization"
      />
    </motion.div>
  );
}


interface EntityBoxProps {
  entity: EntityDefinition;
  label: string;
  isPrincipal: boolean;
  showForeignKey: boolean;
  foreignKeyName?: string;
  highlightNav: boolean;
  navProperty?: string;
}

function EntityBox({ 
  entity, 
  label, 
  isPrincipal, 
  showForeignKey, 
  foreignKeyName,
  highlightNav,
  navProperty
}: EntityBoxProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <motion.div
        className={cn(
          'w-48 rounded-lg border-2 overflow-hidden',
          isPrincipal ? 'border-primary/50' : 'border-blue-500/50'
        )}
      >
        {/* Entity Header */}
        <div className={cn(
          'px-3 py-2 font-medium text-sm',
          isPrincipal ? 'bg-primary/20' : 'bg-blue-500/20'
        )}>
          {entity.name}
        </div>

        {/* Properties */}
        <div className="bg-card p-2 space-y-1">
          {/* Primary Key */}
          <div className="flex items-center gap-2 text-xs">
            <Key className="w-3 h-3 text-yellow-500" />
            <span className="font-mono text-foreground">Id</span>
            <span className="text-muted-foreground">: int</span>
          </div>

          {/* Foreign Key (for dependent) */}
          {showForeignKey && foreignKeyName && (
            <motion.div 
              className="flex items-center gap-2 text-xs"
              animate={highlightNav ? { backgroundColor: 'rgba(59, 130, 246, 0.1)' } : {}}
            >
              <Key className="w-3 h-3 text-blue-500" />
              <span className="font-mono text-foreground">{foreignKeyName}</span>
              <span className="text-muted-foreground">: int</span>
            </motion.div>
          )}

          {/* Other Properties */}
          {entity.properties.map((prop, i) => (
            <div key={i} className="flex items-center gap-2 text-xs pl-5">
              <span className="font-mono text-foreground">{prop}</span>
            </div>
          ))}

          {/* Navigation Property */}
          {navProperty && (
            <motion.div 
              className={cn(
                'flex items-center gap-2 text-xs mt-2 pt-2 border-t border-border',
              )}
              animate={highlightNav ? { 
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                scale: 1.02
              } : {}}
            >
              <ArrowRight className="w-3 h-3 text-green-500" />
              <span className="font-mono text-green-500">{navProperty}</span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

interface RelationshipArrowProps {
  type: RelationshipType;
  isPlaying: boolean;
  multiplier: number;
  highlightNav: boolean;
}

function RelationshipArrow({ type, isPlaying, multiplier, highlightNav }: RelationshipArrowProps) {
  const cardinalityLeft = type === 'many-to-many' ? '*' : '1';
  const cardinalityRight = type === 'one-to-one' ? '1' : '*';

  return (
    <div className="flex items-center gap-2">
      {/* Left cardinality */}
      <span className="text-sm font-bold text-primary">{cardinalityLeft}</span>

      {/* Arrow line */}
      <div className="relative w-24 h-8">
        {/* Base line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />

        {/* Animated data flow */}
        {isPlaying && (
          <>
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary"
              animate={{ left: ['0%', '100%'] }}
              transition={{ 
                duration: 1.5 * multiplier, 
                repeat: Infinity, 
                ease: 'linear' 
              }}
            />
            {type !== 'one-to-one' && (
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500"
                animate={{ left: ['100%', '0%'] }}
                transition={{ 
                  duration: 1.5 * multiplier, 
                  repeat: Infinity, 
                  ease: 'linear',
                  delay: 0.75 * multiplier
                }}
              />
            )}
          </>
        )}

        {/* Arrow heads */}
        <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        {type === 'many-to-many' && (
          <ArrowRight className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-180" />
        )}
      </div>

      {/* Right cardinality */}
      <span className="text-sm font-bold text-blue-500">{cardinalityRight}</span>
    </div>
  );
}

function getRelationshipInfo(type: RelationshipType) {
  switch (type) {
    case 'one-to-one':
      return {
        title: 'One-to-One Relationship',
        description: 'Each entity has exactly one related entity',
        badgeClass: 'bg-purple-500/20 text-purple-500',
      };
    case 'one-to-many':
      return {
        title: 'One-to-Many Relationship',
        description: 'One entity can have many related entities',
        badgeClass: 'bg-blue-500/20 text-blue-500',
      };
    case 'many-to-many':
      return {
        title: 'Many-to-Many Relationship',
        description: 'Many entities can relate to many others',
        badgeClass: 'bg-green-500/20 text-green-500',
      };
  }
}

function getNavProperty(type: RelationshipType, side: 'principal' | 'dependent', relatedName: string): string {
  if (type === 'one-to-one') {
    return relatedName;
  }
  if (type === 'one-to-many') {
    return side === 'principal' ? `${relatedName}s` : relatedName;
  }
  // many-to-many
  return `${relatedName}s`;
}

export default RelationshipDiagram;
