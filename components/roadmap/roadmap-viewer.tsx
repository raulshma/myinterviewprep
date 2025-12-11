'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoadmapNodeComponent } from './roadmap-node';
import { RoadmapEdges } from './roadmap-edges';
import type { Roadmap } from '@/lib/db/schemas/roadmap';
import type { UserRoadmapProgress, NodeProgressStatus } from '@/lib/db/schemas/user-roadmap-progress';
import { cn } from '@/lib/utils';

interface RoadmapViewerProps {
  roadmap: Roadmap;
  progress: UserRoadmapProgress | null;
  selectedNodeId: string | null;
  onNodeClick: (nodeId: string) => void;
  onNodeHover?: (nodeId: string | null) => void;
}

// Calculate canvas bounds from nodes with padding
function calculateBounds(nodes: Roadmap['nodes']) {
  if (nodes.length === 0) return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
  
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  for (const node of nodes) {
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + 200);
    maxY = Math.max(maxY, node.position.y + 80);
  }
  
  return { 
    minX: minX - 100, 
    minY: minY - 50, 
    maxX: maxX + 100, 
    maxY: maxY + 100 
  };
}

export function RoadmapViewer({
  roadmap,
  progress,
  selectedNodeId,
  onNodeClick,
  onNodeHover,
}: RoadmapViewerProps) {
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const bounds = useMemo(() => calculateBounds(roadmap.nodes), [roadmap.nodes]);
  const canvasWidth = bounds.maxX - bounds.minX;
  const canvasHeight = bounds.maxY - bounds.minY;
  
  // Get node status from progress
  const getNodeStatus = useCallback((nodeId: string): NodeProgressStatus => {
    if (!progress) return 'available';
    const nodeProgress = progress.nodeProgress.find(np => np.nodeId === nodeId);
    return nodeProgress?.status || 'locked';
  }, [progress]);
  
  // Zoom controls
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 1.5));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.3));
  const handleReset = () => {
    setZoom(0.8);
    setPan({ x: 50, y: 50 });
  };
  
  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };
  
  const handleMouseUp = () => setIsDragging(false);
  
  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };
  
  // Scroll to zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setZoom(z => Math.min(Math.max(z + delta, 0.3), 1.5));
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] bg-card/50 rounded-2xl border border-border overflow-hidden"
    >
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          className="bg-background/90 backdrop-blur-sm h-8 w-8"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          className="bg-background/90 backdrop-blur-sm h-8 w-8"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          className="bg-background/90 backdrop-blur-sm h-8 w-8"
        >
          <Home className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Zoom indicator */}
      <div className="absolute top-4 left-4 z-20 px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-full text-xs font-medium text-muted-foreground border border-border">
        {Math.round(zoom * 100)}%
      </div>
      
      {/* Canvas */}
      <div
        className={cn(
          'w-full h-full overflow-auto',
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          className="relative"
          style={{
            width: canvasWidth * zoom,
            height: canvasHeight * zoom,
            minWidth: '100%',
            minHeight: '100%',
            padding: '20px',
          }}
        >
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'top left',
              width: canvasWidth,
              height: canvasHeight,
              position: 'relative',
            }}
          >
            {/* Edges (connection lines) */}
            <RoadmapEdges
              nodes={roadmap.nodes}
              edges={roadmap.edges}
              offsetX={-bounds.minX}
              offsetY={-bounds.minY}
            />
            
            {/* Nodes */}
            {roadmap.nodes.map((node, index) => (
              <motion.div
                key={node.id}
                className="absolute"
                style={{
                  left: node.position.x - bounds.minX,
                  top: node.position.y - bounds.minY,
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02, duration: 0.3 }}
              >
                <RoadmapNodeComponent
                  node={node}
                  status={getNodeStatus(node.id)}
                  isActive={selectedNodeId === node.id}
                  onClick={() => onNodeClick(node.id)}
                  onHover={(hovering) => onNodeHover?.(hovering ? node.id : null)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap gap-3 p-3 bg-background/90 backdrop-blur-sm rounded-xl border border-border text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-muted border-2 border-muted-foreground/30" />
          <span className="text-muted-foreground">Locked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-500/30 border-2 border-blue-500/50" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-yellow-500/30 border-2 border-yellow-500/50" />
          <span className="text-muted-foreground">In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500/30 border-2 border-green-500/50" />
          <span className="text-muted-foreground">Completed</span>
        </div>
      </div>
    </div>
  );
}
