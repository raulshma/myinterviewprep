'use server';

/**
 * Public Roadmap Server Actions
 * Handles public roadmap access for unauthenticated users
 * 
 * These actions do NOT require authentication - they are designed for
 * unauthenticated visitors to preview publicly visible roadmaps.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

import {
  getPublicRoadmaps as getPublicRoadmapsService,
  getPublicRoadmapBySlug as getPublicRoadmapBySlugService,
} from '@/lib/services/visibility-service';
import type { PublicRoadmap } from '@/lib/db/schemas/visibility';

/**
 * Get all publicly visible roadmaps
 * 
 * No authentication required - this is for unauthenticated visitors.
 * Returns only roadmaps that have been explicitly marked as public by admins.
 * 
 * Requirements: 4.1 - Return only roadmaps marked as publicly visible
 * 
 * @returns Array of public roadmaps with filtered content
 */
export async function getPublicRoadmaps(): Promise<PublicRoadmap[]> {
  try {
    const roadmaps = await getPublicRoadmapsService();
    return roadmaps;
  } catch (error) {
    console.error('getPublicRoadmaps error:', error);
    // Return empty array on error - don't expose internal errors to public
    return [];
  }
}

/**
 * Get a specific public roadmap by slug
 * 
 * No authentication required - this is for unauthenticated visitors.
 * Returns null for private roadmaps (not an error) to avoid revealing existence.
 * Content is filtered to only include publicly visible milestones and objectives.
 * 
 * Requirements: 
 * - 4.2: Return roadmap data only if marked as publicly visible
 * - 4.3: Return null (not-found response) for private roadmaps without revealing existence
 * - 4.4: Filter out milestones and objectives that are not publicly visible
 * 
 * @param slug - The roadmap slug to retrieve
 * @returns Public roadmap with filtered content, or null if not public/not found
 */
export async function getPublicRoadmapBySlug(
  slug: string
): Promise<PublicRoadmap | null> {
  try {
    // Validate input
    if (!slug || typeof slug !== 'string') {
      return null;
    }

    const roadmap = await getPublicRoadmapBySlugService(slug);
    
    // Returns null for both non-existent and private roadmaps
    // This prevents information disclosure about private roadmap existence
    return roadmap;
  } catch (error) {
    console.error('getPublicRoadmapBySlug error:', error);
    // Return null on error - don't expose internal errors to public
    return null;
  }
}
