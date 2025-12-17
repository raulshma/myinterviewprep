/**
 * Unit tests for public roadmap actions
 * 
 * Tests public roadmap retrieval without authentication
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { PublicRoadmap } from '@/lib/db/schemas/visibility';

// Mock the visibility service
vi.mock('@/lib/services/visibility-service', () => ({
  getPublicRoadmaps: vi.fn(),
  getPublicRoadmapBySlug: vi.fn(),
}));

// Import after mocking
import {
  getPublicRoadmaps as getPublicRoadmapsService,
  getPublicRoadmapBySlug as getPublicRoadmapBySlugService,
} from '@/lib/services/visibility-service';
import {
  getPublicRoadmaps,
  getPublicRoadmapBySlug,
} from './public-roadmaps';

// Helper to create a mock public roadmap
function createMockPublicRoadmap(
  slug: string,
  options?: {
    nodes?: PublicRoadmap['nodes'];
    edges?: PublicRoadmap['edges'];
  }
): PublicRoadmap {
  return {
    slug,
    title: `Roadmap ${slug}`,
    description: `Description for ${slug}`,
    category: 'frontend',
    difficulty: 5,
    estimatedHours: 10,
    nodes: options?.nodes ?? [],
    edges: options?.edges ?? [],
  };
}

describe('Public Roadmap Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  /**
   * Tests for getPublicRoadmaps
   * Requirements: 4.1 - Return only roadmaps marked as publicly visible
   */
  describe('getPublicRoadmaps', () => {
    it('should return only public roadmaps', async () => {
      const mockGetPublicRoadmaps = vi.mocked(getPublicRoadmapsService);
      
      const publicRoadmaps = [
        createMockPublicRoadmap('frontend-basics'),
        createMockPublicRoadmap('react-fundamentals'),
      ];
      mockGetPublicRoadmaps.mockResolvedValue(publicRoadmaps);

      const result = await getPublicRoadmaps();

      expect(result).toHaveLength(2);
      expect(result[0].slug).toBe('frontend-basics');
      expect(result[1].slug).toBe('react-fundamentals');
      expect(mockGetPublicRoadmaps).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no public roadmaps exist', async () => {
      const mockGetPublicRoadmaps = vi.mocked(getPublicRoadmapsService);
      mockGetPublicRoadmaps.mockResolvedValue([]);

      const result = await getPublicRoadmaps();

      expect(result).toEqual([]);
      expect(mockGetPublicRoadmaps).toHaveBeenCalledTimes(1);
    });

    it('should return empty array on service error', async () => {
      const mockGetPublicRoadmaps = vi.mocked(getPublicRoadmapsService);
      mockGetPublicRoadmaps.mockRejectedValue(new Error('Database error'));

      const result = await getPublicRoadmaps();

      // Should return empty array, not throw
      expect(result).toEqual([]);
    });

    it('should not require authentication', async () => {
      const mockGetPublicRoadmaps = vi.mocked(getPublicRoadmapsService);
      mockGetPublicRoadmaps.mockResolvedValue([createMockPublicRoadmap('test')]);

      // No auth mocking needed - this should work without authentication
      const result = await getPublicRoadmaps();

      expect(result).toHaveLength(1);
    });
  });

  /**
   * Tests for getPublicRoadmapBySlug
   * Requirements: 4.2, 4.3, 4.4
   */
  describe('getPublicRoadmapBySlug', () => {
    it('should return public roadmap by slug', async () => {
      const mockGetPublicRoadmapBySlug = vi.mocked(getPublicRoadmapBySlugService);
      
      const publicRoadmap = createMockPublicRoadmap('frontend-basics');
      mockGetPublicRoadmapBySlug.mockResolvedValue(publicRoadmap);

      const result = await getPublicRoadmapBySlug('frontend-basics');

      expect(result).not.toBeNull();
      expect(result?.slug).toBe('frontend-basics');
      expect(mockGetPublicRoadmapBySlug).toHaveBeenCalledWith('frontend-basics');
    });

    /**
     * Requirement 4.3: Return null for private roadmaps without revealing existence
     */
    it('should return null for private roadmaps (not error)', async () => {
      const mockGetPublicRoadmapBySlug = vi.mocked(getPublicRoadmapBySlugService);
      mockGetPublicRoadmapBySlug.mockResolvedValue(null);

      const result = await getPublicRoadmapBySlug('private-roadmap');

      // Should return null, not throw an error
      expect(result).toBeNull();
    });

    it('should return null for non-existent roadmaps', async () => {
      const mockGetPublicRoadmapBySlug = vi.mocked(getPublicRoadmapBySlugService);
      mockGetPublicRoadmapBySlug.mockResolvedValue(null);

      const result = await getPublicRoadmapBySlug('non-existent');

      expect(result).toBeNull();
    });

    it('should return null on service error', async () => {
      const mockGetPublicRoadmapBySlug = vi.mocked(getPublicRoadmapBySlugService);
      mockGetPublicRoadmapBySlug.mockRejectedValue(new Error('Database error'));

      const result = await getPublicRoadmapBySlug('test-roadmap');

      // Should return null, not throw
      expect(result).toBeNull();
    });

    it('should return null for empty slug', async () => {
      const result = await getPublicRoadmapBySlug('');

      expect(result).toBeNull();
    });

    it('should return null for invalid slug type', async () => {
      // @ts-expect-error - Testing invalid input
      const result = await getPublicRoadmapBySlug(null);

      expect(result).toBeNull();
    });

    /**
     * Requirement 4.4: Filter out milestones and objectives that are not publicly visible
     */
    it('should return roadmap with filtered public content', async () => {
      const mockGetPublicRoadmapBySlug = vi.mocked(getPublicRoadmapBySlugService);
      
      // Service returns already-filtered content
      const filteredRoadmap = createMockPublicRoadmap('frontend-basics', {
        nodes: [
          {
            id: 'public-milestone-1',
            title: 'Public Milestone',
            type: 'milestone',
            position: { x: 0, y: 0 },
            learningObjectives: [
              { title: 'Public Objective', lessonId: 'intro-lesson' },
            ],
            estimatedMinutes: 30,
          },
        ],
        edges: [],
      });
      mockGetPublicRoadmapBySlug.mockResolvedValue(filteredRoadmap);

      const result = await getPublicRoadmapBySlug('frontend-basics');

      expect(result).not.toBeNull();
      expect(result?.nodes).toHaveLength(1);
      expect(result?.nodes[0].id).toBe('public-milestone-1');
      expect(result?.nodes[0].learningObjectives).toHaveLength(1);
    });

    it('should not require authentication', async () => {
      const mockGetPublicRoadmapBySlug = vi.mocked(getPublicRoadmapBySlugService);
      mockGetPublicRoadmapBySlug.mockResolvedValue(createMockPublicRoadmap('test'));

      // No auth mocking needed - this should work without authentication
      const result = await getPublicRoadmapBySlug('test');

      expect(result).not.toBeNull();
    });
  });
});
