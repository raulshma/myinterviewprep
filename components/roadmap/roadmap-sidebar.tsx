'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, 
  TrendingUp,
  Clock,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronDown,
  Star,
  ArrowLeft,
  Target,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { Roadmap, RoadmapNode } from '@/lib/db/schemas/roadmap';
import type { UserRoadmapProgress, NodeProgressStatus } from '@/lib/db/schemas/user-roadmap-progress';

interface RoadmapSidebarProps {
  roadmap: Roadmap;
  progress: UserRoadmapProgress | null;
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
}

const statusIcons: Record<NodeProgressStatus, typeof Circle> = {
  locked: Circle,
  available: Circle,
  'in-progress': Circle,
  completed: CheckCircle2,
  skipped: Circle,
};

const statusColors: Record<NodeProgressStatus, string> = {
  locked: 'text-muted-foreground/40',
  available: 'text-blue-500',
  'in-progress': 'text-yellow-500',
  completed: 'text-green-500',
  skipped: 'text-muted-foreground',
};

interface NodeItemProps {
  node: RoadmapNode;
  status: NodeProgressStatus;
  isSelected: boolean;
  onSelect: () => void;
  showSubRoadmap?: boolean;
  isMilestone?: boolean;
}

function NodeItem({ node, status, isSelected, onSelect, showSubRoadmap, isMilestone }: NodeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = statusIcons[status];
  const hasObjectives = node.learningObjectives && node.learningObjectives.length > 0;
  
  const handleToggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasObjectives) {
      setIsExpanded(prev => !prev);
    }
  }, [hasObjectives]);
  
  return (
    <li>
      <div
        className={cn(
          'w-full flex items-center gap-3 px-3 rounded-xl transition-colors text-left',
          isMilestone ? 'py-2.5' : 'py-2',
          isSelected 
            ? 'bg-primary/10 text-primary' 
            : 'hover:bg-secondary/50 text-foreground',
          status === 'locked' && 'opacity-50'
        )}
      >
        {/* Expand/Collapse button */}
        {hasObjectives ? (
          <button
            onClick={handleToggleExpand}
            className="p-0.5 -ml-1 hover:bg-secondary/50 rounded transition-colors"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className={cn('w-3.5 h-3.5', statusColors[status])} />
            </motion.div>
          </button>
        ) : (
          <Icon className={cn(isMilestone ? 'w-4 h-4' : 'w-3.5 h-3.5', statusColors[status])} />
        )}
        
        {/* Node title button */}
        <button
          onClick={onSelect}
          className="flex-1 text-left flex items-center gap-2 min-w-0"
        >
          <span className={cn('text-sm truncate', isMilestone && 'font-medium')}>
            {node.title}
          </span>
          {showSubRoadmap && node.subRoadmapSlug && (
            <Star className="w-3 h-3 text-amber-500 shrink-0" fill="currentColor" />
          )}
        </button>
        
        {isSelected && (
          <ChevronRight className="w-4 h-4 shrink-0" />
        )}
      </div>
      
      {/* Learning Objectives Dropdown */}
      <AnimatePresence>
        {isExpanded && hasObjectives && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ul className="ml-6 pl-3 border-l border-border/50 mt-1 mb-2 space-y-1">
              {node.learningObjectives.map((objective, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-2 py-1.5 px-2 rounded-lg text-xs text-muted-foreground hover:bg-secondary/30 transition-colors"
                >
                  <Target className="w-3 h-3 mt-0.5 text-primary/60 shrink-0" />
                  <span className="line-clamp-2">{objective}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function RoadmapSidebar({
  roadmap,
  progress,
  selectedNodeId,
  onNodeSelect,
}: RoadmapSidebarProps) {
  const nodesCompleted = progress?.nodesCompleted || 0;
  const totalNodes = roadmap.nodes.length;
  const progressPercent = Math.round((nodesCompleted / totalNodes) * 100);
  
  const getNodeStatus = (nodeId: string): NodeProgressStatus => {
    if (!progress) return 'available';
    const nodeProgress = progress.nodeProgress.find(np => np.nodeId === nodeId);
    return nodeProgress?.status || 'locked';
  };
  
  // Group nodes by type for organized display
  const milestones = roadmap.nodes.filter(n => n.type === 'milestone');
  const topics = roadmap.nodes.filter(n => n.type === 'topic');
  const optional = roadmap.nodes.filter(n => n.type === 'optional');
  
  return (
    <aside className="w-full flex flex-col bg-sidebar border border-border rounded-2xl">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <Link
          href="/roadmaps"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          All Roadmaps
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Map className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground truncate">{roadmap.title}</h2>
            <p className="text-xs text-muted-foreground">{totalNodes} topics</p>
          </div>
        </div>
      </div>
      
      {/* Progress Overview */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">Your Progress</span>
          <span className="text-sm font-bold text-primary">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-2 mb-3" />
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-secondary/30">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Completed</span>
            </div>
            <p className="text-lg font-bold text-foreground">{nodesCompleted}</p>
          </div>
          <div className="p-3 rounded-xl bg-secondary/30">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Est. Time</span>
            </div>
            <p className="text-lg font-bold text-foreground">{roadmap.estimatedHours}h</p>
          </div>
        </div>
      </div>
      
      {/* Node List */}
      <div className="p-4">
        {/* Milestones */}
        {milestones.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Milestones
            </h3>
            <ul className="space-y-1">
              {milestones.map((node) => (
                <NodeItem
                  key={node.id}
                  node={node}
                  status={getNodeStatus(node.id)}
                  isSelected={selectedNodeId === node.id}
                  onSelect={() => onNodeSelect(node.id)}
                  showSubRoadmap
                  isMilestone
                />
              ))}
            </ul>
          </div>
        )}
        
        {/* Regular Topics */}
        {topics.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Topics
            </h3>
            <ul className="space-y-1">
              {topics.map((node) => (
                <NodeItem
                  key={node.id}
                  node={node}
                  status={getNodeStatus(node.id)}
                  isSelected={selectedNodeId === node.id}
                  onSelect={() => onNodeSelect(node.id)}
                />
              ))}
            </ul>
          </div>
        )}
        
        {/* Optional Topics */}
        {optional.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Optional
            </h3>
            <ul className="space-y-1">
              {optional.map((node) => (
                <NodeItem
                  key={node.id}
                  node={node}
                  status={getNodeStatus(node.id)}
                  isSelected={selectedNodeId === node.id}
                  onSelect={() => onNodeSelect(node.id)}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
