import { z } from 'zod';
import type { RoadmapCategory, RoadmapNodeType, NodePosition, RoadmapEdge, LearningObjective } from './roadmap';
import type { DifficultyLevel } from './learning-path';

// Entity types that can have visibility settings
export const EntityTypeSchema = z.enum([
  'roadmap',
  'milestone',
  'objective',
]);

// Visibility setting schema for database storage
export const VisibilitySettingSchema = z.object({
  _id: z.string(),
  entityType: EntityTypeSchema,
  entityId: z.string().min(1),
  // Parent references for hierarchy
  parentRoadmapSlug: z.string().optional(),
  parentMilestoneId: z.string().optional(),
  // Visibility flag
  isPublic: z.boolean().default(false),
  // Audit fields
  updatedBy: z.string().min(1), // Admin clerk ID
  updatedAt: z.date(),
  createdAt: z.date(),
});

// Schema for creating a new visibility setting (without generated fields)
export const CreateVisibilitySettingSchema = VisibilitySettingSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema for updating a visibility setting
export const UpdateVisibilitySettingSchema = z.object({
  isPublic: z.boolean(),
  updatedBy: z.string().min(1),
});

// Export types
export type EntityType = z.infer<typeof EntityTypeSchema>;
export type VisibilitySetting = z.infer<typeof VisibilitySettingSchema>;
export type CreateVisibilitySetting = z.infer<typeof CreateVisibilitySettingSchema>;
export type UpdateVisibilitySetting = z.infer<typeof UpdateVisibilitySettingSchema>;

// Public roadmap response types (filtered for public consumption)
export interface PublicRoadmap {
  slug: string;
  title: string;
  description: string;
  category: RoadmapCategory;
  difficulty: DifficultyLevel;
  estimatedHours: number;
  // Only public nodes included
  nodes: PublicRoadmapNode[];
  edges: RoadmapEdge[];
}

export interface PublicRoadmapNode {
  id: string;
  title: string;
  description?: string;
  type: RoadmapNodeType;
  position: NodePosition;
  // Only public objectives included
  learningObjectives: LearningObjective[];
  estimatedMinutes: number;
  difficulty?: DifficultyLevel;
}

// Visibility overview types for admin UI
export interface VisibilityOverview {
  roadmaps: RoadmapVisibilityInfo[];
  stats: {
    totalRoadmaps: number;
    publicRoadmaps: number;
    totalMilestones: number;
    publicMilestones: number;
    totalObjectives: number;
    publicObjectives: number;
  };
}

export interface RoadmapVisibilityInfo {
  slug: string;
  title: string;
  isPublic: boolean;
  milestoneCount: number;
  publicMilestoneCount: number;
}

export interface RoadmapVisibilityDetails {
  roadmap: RoadmapVisibilityInfo;
  milestones: MilestoneVisibilityInfo[];
}

export interface MilestoneVisibilityInfo {
  nodeId: string;
  title: string;
  isPublic: boolean;
  effectivelyPublic: boolean; // Considering parent visibility
  objectives: ObjectiveVisibilityInfo[];
}

export interface ObjectiveVisibilityInfo {
  index: number;
  title: string;
  isPublic: boolean;
  effectivelyPublic: boolean; // Considering parent visibility
}
