import { cache } from 'react';
import {
  getVisibility,
  setVisibility,
  getVisibilityBatch,
  findPublicEntities,
  getVisibilityByParent,
} from '@/lib/db/repositories/visibility-repository';
import { getRoadmapsCollection } from '@/lib/db/collections';
import { logVisibilityChange } from './audit-log';
import type {
  EntityType,
  VisibilitySetting,
  PublicRoadmap,
  PublicRoadmapNode,
  VisibilityOverview,
  RoadmapVisibilityInfo,
  RoadmapVisibilityDetails,
  MilestoneVisibilityInfo,
  ObjectiveVisibilityInfo,
} from '@/lib/db/schemas/visibility';
import type { RoadmapDocument } from '@/lib/db/collections';

/**
 * Visibility Error for handling visibility-related errors
 */
export enum VisibilityErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
  PARENT_NOT_FOUND = 'PARENT_NOT_FOUND',
  INVALID_ENTITY_TYPE = 'INVALID_ENTITY_TYPE',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

export class VisibilityError extends Error {
  constructor(
    message: string,
    public code: VisibilityErrorCode,
    public entityType?: EntityType,
    public entityId?: string
  ) {
    super(message);
    this.name = 'VisibilityError';
  }
}

/**
 * Check if an entity is publicly visible, considering hierarchical rules.
 * - If a roadmap is private, all its milestones and objectives are private
 * - If a milestone is private, all its objectives are private
 */
export const isPubliclyVisible = cache(async (
  entityType: EntityType,
  entityId: string
): Promise<boolean> => {
  const setting = await getVisibility(entityType, entityId);

  // If no setting exists, default to private
  if (!setting || !setting.isPublic) {
    return false;
  }

  // For roadmaps, just check the direct setting
  if (entityType === 'roadmap') {
    return setting.isPublic;
  }

  // For milestones, check parent roadmap visibility
  if (entityType === 'milestone') {
    if (!setting.parentRoadmapSlug) {
      return false;
    }
    const parentVisible = await isPubliclyVisible('roadmap', setting.parentRoadmapSlug);
    return parentVisible && setting.isPublic;
  }

  // For objectives, check parent milestone and roadmap visibility
  if (entityType === 'objective') {
    if (!setting.parentMilestoneId || !setting.parentRoadmapSlug) {
      return false;
    }
    const milestoneVisible = await isPubliclyVisible('milestone', setting.parentMilestoneId);
    return milestoneVisible && setting.isPublic;
  }

  return false;
});

/**
 * Validate that parent entities exist before updating visibility
 */
async function validateParentExists(
  entityType: EntityType,
  parentRoadmapSlug?: string,
  parentMilestoneId?: string
): Promise<void> {
  if (entityType === 'roadmap') {
    // Roadmaps have no parent to validate
    return;
  }

  if (entityType === 'milestone') {
    if (!parentRoadmapSlug) {
      throw new VisibilityError(
        'Milestone visibility requires a parent roadmap slug',
        VisibilityErrorCode.PARENT_NOT_FOUND,
        entityType
      );
    }
    // Check if roadmap exists
    const collection = await getRoadmapsCollection();
    const roadmap = await collection.findOne({ slug: parentRoadmapSlug });
    if (!roadmap) {
      throw new VisibilityError(
        `Parent roadmap '${parentRoadmapSlug}' not found`,
        VisibilityErrorCode.PARENT_NOT_FOUND,
        entityType
      );
    }
    return;
  }

  if (entityType === 'objective') {
    if (!parentRoadmapSlug || !parentMilestoneId) {
      throw new VisibilityError(
        'Objective visibility requires both parent roadmap slug and milestone ID',
        VisibilityErrorCode.PARENT_NOT_FOUND,
        entityType
      );
    }
    // Check if roadmap exists
    const collection = await getRoadmapsCollection();
    const roadmap = await collection.findOne({ slug: parentRoadmapSlug });
    if (!roadmap) {
      throw new VisibilityError(
        `Parent roadmap '${parentRoadmapSlug}' not found`,
        VisibilityErrorCode.PARENT_NOT_FOUND,
        entityType
      );
    }
    // Check if milestone exists in roadmap
    const milestoneExists = roadmap.nodes.some(node => node.id === parentMilestoneId);
    if (!milestoneExists) {
      throw new VisibilityError(
        `Parent milestone '${parentMilestoneId}' not found in roadmap '${parentRoadmapSlug}'`,
        VisibilityErrorCode.PARENT_NOT_FOUND,
        entityType
      );
    }
    return;
  }
}

/**
 * Update visibility for an entity with parent validation and audit logging
 */
export async function updateVisibility(
  adminId: string,
  entityType: EntityType,
  entityId: string,
  isPublic: boolean,
  parentRoadmapSlug?: string,
  parentMilestoneId?: string
): Promise<VisibilitySetting> {
  // Validate parent exists
  await validateParentExists(entityType, parentRoadmapSlug, parentMilestoneId);

  // Get current visibility for audit log
  const currentSetting = await getVisibility(entityType, entityId);
  const oldValue = currentSetting?.isPublic ?? null;

  // Log the change for audit purposes BEFORE updating
  // This ensures audit log is created before returning success (Requirement 6.1-6.4)
  await logVisibilityChange(
    adminId,
    entityType,
    entityId,
    oldValue,
    isPublic,
    parentRoadmapSlug,
    parentMilestoneId
  );

  // Update visibility
  const newSetting = await setVisibility({
    entityType,
    entityId,
    isPublic,
    parentRoadmapSlug,
    parentMilestoneId,
    updatedBy: adminId,
  });

  return newSetting;
}


/**
 * Get all publicly visible roadmaps
 */
export const getPublicRoadmaps = cache(async (): Promise<PublicRoadmap[]> => {
  // Get all roadmaps marked as public
  const publicRoadmapSlugs = await findPublicEntities('roadmap');
  
  if (publicRoadmapSlugs.length === 0) {
    return [];
  }

  // Fetch roadmap documents
  const collection = await getRoadmapsCollection();
  const roadmaps = await collection
    .find({ slug: { $in: publicRoadmapSlugs }, isActive: true })
    .toArray();

  // Filter content for each roadmap
  const publicRoadmaps: PublicRoadmap[] = [];
  
  for (const roadmap of roadmaps) {
    const publicRoadmap = await filterRoadmapForPublic(roadmap);
    if (publicRoadmap) {
      publicRoadmaps.push(publicRoadmap);
    }
  }

  return publicRoadmaps;
});

/**
 * Get a specific public roadmap by slug with filtered content
 */
export const getPublicRoadmapBySlug = cache(async (
  slug: string
): Promise<PublicRoadmap | null> => {
  // Check if roadmap is publicly visible
  const isVisible = await isPubliclyVisible('roadmap', slug);
  if (!isVisible) {
    return null;
  }

  // Fetch roadmap document
  const collection = await getRoadmapsCollection();
  const roadmap = await collection.findOne({ slug, isActive: true });
  
  if (!roadmap) {
    return null;
  }

  return filterRoadmapForPublic(roadmap);
});

/**
 * Filter roadmap content to only include publicly visible milestones and objectives
 */
async function filterRoadmapForPublic(
  roadmap: RoadmapDocument
): Promise<PublicRoadmap | null> {
  const slug = roadmap.slug;
  
  // Get visibility settings for all milestones in this roadmap
  const milestoneSettings = await getVisibilityByParent('milestone', slug);
  const publicMilestoneIds = new Set(
    milestoneSettings
      .filter(s => s.isPublic)
      .map(s => s.entityId)
  );

  // Filter nodes to only include public milestones
  const publicNodes: PublicRoadmapNode[] = [];
  
  for (const node of roadmap.nodes) {
    // Check if this node (milestone) is public
    if (!publicMilestoneIds.has(node.id)) {
      continue;
    }

    // Get visibility settings for objectives in this milestone
    const objectiveSettings = await getVisibilityByParent('objective', node.id);
    const publicObjectiveIndices = new Set(
      objectiveSettings
        .filter(s => s.isPublic)
        .map(s => parseInt(s.entityId.split('-').pop() || '0', 10))
    );

    // Filter learning objectives
    const publicObjectives = node.learningObjectives.filter((_, index) => 
      publicObjectiveIndices.has(index)
    );

    publicNodes.push({
      id: node.id,
      title: node.title,
      description: node.description,
      type: node.type,
      position: node.position,
      learningObjectives: publicObjectives,
      estimatedMinutes: node.estimatedMinutes,
      difficulty: node.difficulty,
    });
  }

  // Filter edges to only include connections between public nodes
  const publicNodeIds = new Set(publicNodes.map(n => n.id));
  const publicEdges = roadmap.edges.filter(
    edge => publicNodeIds.has(edge.source) && publicNodeIds.has(edge.target)
  );

  return {
    slug: roadmap.slug,
    title: roadmap.title,
    description: roadmap.description,
    category: roadmap.category,
    difficulty: roadmap.difficulty,
    estimatedHours: roadmap.estimatedHours,
    nodes: publicNodes,
    edges: publicEdges,
  };
}


/**
 * Get visibility overview for admin UI
 */
export const getVisibilityOverview = cache(async (): Promise<VisibilityOverview> => {
  const collection = await getRoadmapsCollection();
  
  // Get all active roadmaps
  const roadmaps = await collection.find({ isActive: true }).toArray();
  
  // Get all visibility settings
  const roadmapSlugs = roadmaps.map(r => r.slug);
  const roadmapVisibility = await getVisibilityBatch('roadmap', roadmapSlugs);
  
  // Calculate stats
  let totalMilestones = 0;
  let publicMilestones = 0;
  let totalObjectives = 0;
  let publicObjectives = 0;
  
  const roadmapInfos: RoadmapVisibilityInfo[] = [];
  
  for (const roadmap of roadmaps) {
    const visibility = roadmapVisibility.get(roadmap.slug);
    const isPublic = visibility?.isPublic ?? false;
    
    // Get milestone visibility for this roadmap
    const milestoneSettings = await getVisibilityByParent('milestone', roadmap.slug);
    const publicMilestoneCount = milestoneSettings.filter(s => s.isPublic).length;
    
    // Count objectives
    for (const node of roadmap.nodes) {
      totalMilestones++;
      if (milestoneSettings.some(s => s.entityId === node.id && s.isPublic)) {
        publicMilestones++;
      }
      
      const objectiveCount = node.learningObjectives.length;
      totalObjectives += objectiveCount;
      
      // Get objective visibility for this milestone
      const objectiveSettings = await getVisibilityByParent('objective', node.id);
      publicObjectives += objectiveSettings.filter(s => s.isPublic).length;
    }
    
    roadmapInfos.push({
      slug: roadmap.slug,
      title: roadmap.title,
      isPublic,
      milestoneCount: roadmap.nodes.length,
      publicMilestoneCount,
    });
  }
  
  return {
    roadmaps: roadmapInfos,
    stats: {
      totalRoadmaps: roadmaps.length,
      publicRoadmaps: roadmapInfos.filter(r => r.isPublic).length,
      totalMilestones,
      publicMilestones,
      totalObjectives,
      publicObjectives,
    },
  };
});

/**
 * Get detailed visibility information for a specific roadmap
 */
export const getRoadmapVisibilityDetails = cache(async (
  roadmapSlug: string
): Promise<RoadmapVisibilityDetails | null> => {
  const collection = await getRoadmapsCollection();
  const roadmap = await collection.findOne({ slug: roadmapSlug, isActive: true });
  
  if (!roadmap) {
    return null;
  }
  
  // Get roadmap visibility
  const roadmapVisibility = await getVisibility('roadmap', roadmapSlug);
  const isRoadmapPublic = roadmapVisibility?.isPublic ?? false;
  
  // Get milestone visibility settings
  const milestoneSettings = await getVisibilityByParent('milestone', roadmapSlug);
  const milestoneVisibilityMap = new Map(
    milestoneSettings.map(s => [s.entityId, s.isPublic])
  );
  
  const milestones: MilestoneVisibilityInfo[] = [];
  
  for (const node of roadmap.nodes) {
    const isMilestonePublic = milestoneVisibilityMap.get(node.id) ?? false;
    const effectivelyPublic = isRoadmapPublic && isMilestonePublic;
    
    // Get objective visibility settings
    const objectiveSettings = await getVisibilityByParent('objective', node.id);
    const objectiveVisibilityMap = new Map(
      objectiveSettings.map(s => [s.entityId, s.isPublic])
    );
    
    const objectives: ObjectiveVisibilityInfo[] = node.learningObjectives.map(
      (obj, index) => {
        const objectiveId = `${node.id}-objective-${index}`;
        const isObjectivePublic = objectiveVisibilityMap.get(objectiveId) ?? false;
        
        return {
          index,
          title: typeof obj === 'string' ? obj : obj.title,
          isPublic: isObjectivePublic,
          effectivelyPublic: effectivelyPublic && isObjectivePublic,
        };
      }
    );
    
    milestones.push({
      nodeId: node.id,
      title: node.title,
      isPublic: isMilestonePublic,
      effectivelyPublic,
      objectives,
    });
  }
  
  return {
    roadmap: {
      slug: roadmap.slug,
      title: roadmap.title,
      isPublic: isRoadmapPublic,
      milestoneCount: roadmap.nodes.length,
      publicMilestoneCount: milestoneSettings.filter(s => s.isPublic).length,
    },
    milestones,
  };
});
