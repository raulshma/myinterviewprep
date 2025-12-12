'use client';

import { useCallback, useEffect, useState } from 'react';
import type { UserGamification } from '@/lib/db/schemas/user';

/**
 * Unified objective/lesson progress tracking
 * Syncs between database (gamification) and localStorage for consistent UI
 */

export interface ObjectiveProgressData {
  completedAt: string;
  level: string;
  xpEarned: number;
  lessonId: string;
}

// Storage key for objective progress (matches roadmap-topic-detail.tsx)
export function getObjectiveProgressKey(nodeId: string, lessonId: string): string {
  return `objective_progress_${nodeId}_${lessonId}`;
}

// Storage key for lesson progress (matches use-lesson-progress.tsx)
export function getLessonProgressKey(lessonId: string, level: string): string {
  return `lesson_progress_${lessonId}_${level}`;
}

/**
 * Save objective progress to localStorage
 * Called after successful lesson completion
 */
export function saveObjectiveProgress(
  nodeId: string,
  lessonId: string,
  level: string,
  xpEarned: number
): void {
  if (typeof window === 'undefined') return;
  
  const key = getObjectiveProgressKey(nodeId, lessonId);
  const data: ObjectiveProgressData = {
    completedAt: new Date().toISOString(),
    level,
    xpEarned,
    lessonId,
  };
  
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Get objective progress from localStorage
 */
export function getObjectiveProgress(
  nodeId: string,
  lessonId: string
): ObjectiveProgressData | null {
  if (typeof window === 'undefined') return null;
  
  const key = getObjectiveProgressKey(nodeId, lessonId);
  const stored = localStorage.getItem(key);
  
  if (!stored) return null;
  
  try {
    return JSON.parse(stored) as ObjectiveProgressData;
  } catch {
    return null;
  }
}

/**
 * Sync gamification data to localStorage for roadmap UI
 * Call this when gamification data is loaded from server
 */
export function syncGamificationToLocalStorage(
  gamification: UserGamification | null,
  nodeId?: string
): void {
  if (typeof window === 'undefined' || !gamification?.completedLessons) return;
  
  for (const lesson of gamification.completedLessons) {
    if (!lesson.completedAt) continue;
    
    // Extract nodeId from lessonId (format: "nodeId/lessonSlug")
    const parts = lesson.lessonId.split('/');
    const extractedNodeId = parts[0];
    
    // If nodeId is specified, only sync for that node
    if (nodeId && extractedNodeId !== nodeId) continue;
    
    const key = getObjectiveProgressKey(extractedNodeId, lesson.lessonId);
    
    // Only write if not already present (don't overwrite newer local data)
    if (!localStorage.getItem(key)) {
      const data: ObjectiveProgressData = {
        completedAt: lesson.completedAt instanceof Date 
          ? lesson.completedAt.toISOString() 
          : String(lesson.completedAt),
        level: lesson.experienceLevel,
        xpEarned: lesson.xpEarned,
        lessonId: lesson.lessonId,
      };
      localStorage.setItem(key, JSON.stringify(data));
    }
  }
}

/**
 * Clear objective progress from localStorage
 */
export function clearObjectiveProgress(nodeId: string, lessonId: string): void {
  if (typeof window === 'undefined') return;
  
  const key = getObjectiveProgressKey(nodeId, lessonId);
  localStorage.removeItem(key);
}

/**
 * Hook to manage objective progress with sync to localStorage
 */
export function useObjectiveProgress(
  nodeId: string,
  objectives: Array<{ lessonId: string; objective: string }>,
  gamification: UserGamification | null
) {
  // Initialize progress map from localStorage/gamification on first render
  const [progressMap, setProgressMap] = useState<Record<string, ObjectiveProgressData>>(() => {
    if (typeof window === 'undefined') return {};
    
    // Sync gamification to localStorage first
    if (gamification) {
      syncGamificationToLocalStorage(gamification, nodeId);
    }
    
    // Load from localStorage
    const progress: Record<string, ObjectiveProgressData> = {};
    for (const obj of objectives) {
      const stored = getObjectiveProgress(nodeId, obj.lessonId);
      if (stored) {
        progress[obj.objective] = stored;
      }
    }
    return progress;
  });
  
  // Re-sync when gamification or objectives change
  useEffect(() => {
    // Sync gamification to localStorage
    if (gamification) {
      syncGamificationToLocalStorage(gamification, nodeId);
    }
    
    // Reload from localStorage
    const progress: Record<string, ObjectiveProgressData> = {};
    for (const obj of objectives) {
      const stored = getObjectiveProgress(nodeId, obj.lessonId);
      if (stored) {
        progress[obj.objective] = stored;
      }
    }
    
    // Only update if there are actual changes
    setProgressMap(prev => {
      const prevKeys = Object.keys(prev).sort().join(',');
      const newKeys = Object.keys(progress).sort().join(',');
      if (prevKeys !== newKeys) return progress;
      
      // Check if any values changed
      for (const key of Object.keys(progress)) {
        if (prev[key]?.completedAt !== progress[key]?.completedAt) {
          return progress;
        }
      }
      return prev;
    });
  }, [nodeId, objectives, gamification]);
  
  // Mark objective as complete
  const markComplete = useCallback((
    objective: string,
    lessonId: string,
    level: string,
    xpEarned: number
  ) => {
    saveObjectiveProgress(nodeId, lessonId, level, xpEarned);
    
    setProgressMap(prev => ({
      ...prev,
      [objective]: {
        completedAt: new Date().toISOString(),
        level,
        xpEarned,
        lessonId,
      },
    }));
  }, [nodeId]);
  
  // Reset objective progress
  const resetObjective = useCallback((objective: string, lessonId: string) => {
    clearObjectiveProgress(nodeId, lessonId);
    
    setProgressMap(prev => {
      const next = { ...prev };
      delete next[objective];
      return next;
    });
  }, [nodeId]);
  
  // Get completion count
  const completedCount = Object.keys(progressMap).filter(
    key => progressMap[key]?.completedAt
  ).length;
  
  return {
    progressMap,
    markComplete,
    resetObjective,
    completedCount,
    isObjectiveComplete: (objective: string) => !!progressMap[objective]?.completedAt,
    getObjectiveXp: (objective: string) => progressMap[objective]?.xpEarned ?? 0,
  };
}
