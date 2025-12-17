/**
 * Property-based tests for visibility service
 * 
 * Tests hierarchical visibility rules and service behavior
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import type { EntityType, VisibilitySetting } from '@/lib/db/schemas/visibility';

// Mock the repository and collections
vi.mock('@/lib/db/repositories/visibility-repository', () => ({
  getVisibility: vi.fn(),
  setVisibility: vi.fn(),
  getVisibilityBatch: vi.fn(),
  findPublicEntities: vi.fn(),
  getVisibilityByParent: vi.fn(),
}));

vi.mock('@/lib/db/collections', () => ({
  getRoadmapsCollection: vi.fn(),
}));

vi.mock('./audit-log', () => ({
  logAdminAction: vi.fn(),
  logVisibilityChange: vi.fn(),
}));

// Import after mocking
import {
  isPubliclyVisible,
  updateVisibility,
  VisibilityError,
  VisibilityErrorCode,
} from './visibility-service';
import {
  getVisibility,
  setVisibility,
} from '@/lib/db/repositories/visibility-repository';
import { getRoadmapsCollection } from '@/lib/db/collections';
import { logVisibilityChange } from './audit-log';

// Arbitrary generators
const entityTypeArb = fc.constantFrom<EntityType>('roadmap', 'milestone', 'objective');
const entityIdArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
const roadmapSlugArb = fc.stringMatching(/^[a-z0-9][a-z0-9-]{0,48}[a-z0-9]$|^[a-z0-9]$/)
  .filter(s => s.length >= 1 && s.length <= 50);
const adminIdArb = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);


// Helper to create a mock visibility setting
function createMockVisibilitySetting(
  entityType: EntityType,
  entityId: string,
  isPublic: boolean,
  parentRoadmapSlug?: string,
  parentMilestoneId?: string
): VisibilitySetting {
  return {
    _id: `vis-${entityId}`,
    entityType,
    entityId,
    isPublic,
    parentRoadmapSlug,
    parentMilestoneId,
    updatedBy: 'admin-123',
    updatedAt: new Date(),
    createdAt: new Date(),
  };
}

describe('Visibility Service Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  /**
   * **Feature: roadmap-public-visibility, Property 3: Hierarchical Visibility Override**
   * 
   * For any entity with a private parent (roadmap for milestones, milestone for objectives),
   * the effective visibility should be private regardless of the entity's own visibility setting.
   * 
   * **Validates: Requirements 2.3, 3.3**
   */
  describe('Property 3: Hierarchical Visibility Override', () => {
    it('milestone with private parent roadmap should always be private', async () => {
      await fc.assert(
        fc.asyncProperty(
          roadmapSlugArb,
          entityIdArb,
          fc.boolean(), // milestone's own visibility setting
          async (roadmapSlug, milestoneId, milestoneIsPublic) => {
            const mockGetVisibility = vi.mocked(getVisibility);
            
            // Setup: milestone has some visibility setting, but parent roadmap is private
            mockGetVisibility.mockImplementation(async (type, id) => {
              if (type === 'milestone' && id === milestoneId) {
                return createMockVisibilitySetting(
                  'milestone',
                  milestoneId,
                  milestoneIsPublic,
                  roadmapSlug
                );
              }
              if (type === 'roadmap' && id === roadmapSlug) {
                // Parent roadmap is PRIVATE
                return createMockVisibilitySetting('roadmap', roadmapSlug, false);
              }
              return null;
            });

            // Clear cache by calling with unique params
            const result = await isPubliclyVisible('milestone', milestoneId);
            
            // Regardless of milestone's own setting, it should be private
            // because parent roadmap is private
            expect(result).toBe(false);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('objective with private parent milestone should always be private', async () => {
      await fc.assert(
        fc.asyncProperty(
          roadmapSlugArb,
          entityIdArb,
          entityIdArb,
          fc.boolean(), // objective's own visibility setting
          async (roadmapSlug, milestoneId, objectiveId, objectiveIsPublic) => {
            const mockGetVisibility = vi.mocked(getVisibility);
            
            // Setup: objective has some visibility, milestone is private, roadmap is public
            mockGetVisibility.mockImplementation(async (type, id) => {
              if (type === 'objective' && id === objectiveId) {
                return createMockVisibilitySetting(
                  'objective',
                  objectiveId,
                  objectiveIsPublic,
                  roadmapSlug,
                  milestoneId
                );
              }
              if (type === 'milestone' && id === milestoneId) {
                // Parent milestone is PRIVATE
                return createMockVisibilitySetting(
                  'milestone',
                  milestoneId,
                  false,
                  roadmapSlug
                );
              }
              if (type === 'roadmap' && id === roadmapSlug) {
                // Roadmap is public
                return createMockVisibilitySetting('roadmap', roadmapSlug, true);
              }
              return null;
            });

            const result = await isPubliclyVisible('objective', objectiveId);
            
            // Regardless of objective's own setting, it should be private
            // because parent milestone is private
            expect(result).toBe(false);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('objective with private grandparent roadmap should always be private', async () => {
      await fc.assert(
        fc.asyncProperty(
          roadmapSlugArb,
          entityIdArb,
          entityIdArb,
          fc.boolean(), // objective's own visibility
          fc.boolean(), // milestone's own visibility
          async (roadmapSlug, milestoneId, objectiveId, objectiveIsPublic, milestoneIsPublic) => {
            const mockGetVisibility = vi.mocked(getVisibility);
            
            // Setup: roadmap is private, milestone and objective have various settings
            mockGetVisibility.mockImplementation(async (type, id) => {
              if (type === 'objective' && id === objectiveId) {
                return createMockVisibilitySetting(
                  'objective',
                  objectiveId,
                  objectiveIsPublic,
                  roadmapSlug,
                  milestoneId
                );
              }
              if (type === 'milestone' && id === milestoneId) {
                return createMockVisibilitySetting(
                  'milestone',
                  milestoneId,
                  milestoneIsPublic,
                  roadmapSlug
                );
              }
              if (type === 'roadmap' && id === roadmapSlug) {
                // Roadmap is PRIVATE
                return createMockVisibilitySetting('roadmap', roadmapSlug, false);
              }
              return null;
            });

            const result = await isPubliclyVisible('objective', objectiveId);
            
            // Regardless of objective's or milestone's own settings,
            // it should be private because grandparent roadmap is private
            expect(result).toBe(false);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('entity is public only when all ancestors are public', async () => {
      await fc.assert(
        fc.asyncProperty(
          roadmapSlugArb,
          entityIdArb,
          entityIdArb,
          async (roadmapSlug, milestoneId, objectiveId) => {
            const mockGetVisibility = vi.mocked(getVisibility);
            
            // Setup: all entities are public
            mockGetVisibility.mockImplementation(async (type, id) => {
              if (type === 'objective' && id === objectiveId) {
                return createMockVisibilitySetting(
                  'objective',
                  objectiveId,
                  true,
                  roadmapSlug,
                  milestoneId
                );
              }
              if (type === 'milestone' && id === milestoneId) {
                return createMockVisibilitySetting(
                  'milestone',
                  milestoneId,
                  true,
                  roadmapSlug
                );
              }
              if (type === 'roadmap' && id === roadmapSlug) {
                return createMockVisibilitySetting('roadmap', roadmapSlug, true);
              }
              return null;
            });

            const result = await isPubliclyVisible('objective', objectiveId);
            
            // When all ancestors are public, the entity should be public
            expect(result).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});


  /**
   * **Feature: roadmap-public-visibility, Property 4: Parent Existence Validation**
   * 
   * For any visibility change on a milestone or objective, the system should reject
   * the change if the parent entity (roadmap or milestone) does not exist.
   * 
   * **Validates: Requirements 2.4, 3.4**
   */
  describe('Property 4: Parent Existence Validation', () => {
    it('milestone visibility change should be rejected when parent roadmap does not exist', async () => {
      await fc.assert(
        fc.asyncProperty(
          roadmapSlugArb,
          entityIdArb,
          adminIdArb,
          fc.boolean(),
          async (roadmapSlug, milestoneId, adminId, isPublic) => {
            const mockGetRoadmapsCollection = vi.mocked(getRoadmapsCollection);
            
            // Setup: roadmap does not exist
            const mockCollection = {
              findOne: vi.fn().mockResolvedValue(null),
            };
            mockGetRoadmapsCollection.mockResolvedValue(mockCollection as never);

            // Attempt to update milestone visibility
            await expect(
              updateVisibility(
                adminId,
                'milestone',
                milestoneId,
                isPublic,
                roadmapSlug
              )
            ).rejects.toThrow(VisibilityError);

            try {
              await updateVisibility(
                adminId,
                'milestone',
                milestoneId,
                isPublic,
                roadmapSlug
              );
            } catch (error) {
              expect(error).toBeInstanceOf(VisibilityError);
              expect((error as VisibilityError).code).toBe(VisibilityErrorCode.PARENT_NOT_FOUND);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('objective visibility change should be rejected when parent roadmap does not exist', async () => {
      await fc.assert(
        fc.asyncProperty(
          roadmapSlugArb,
          entityIdArb,
          entityIdArb,
          adminIdArb,
          fc.boolean(),
          async (roadmapSlug, milestoneId, objectiveId, adminId, isPublic) => {
            const mockGetRoadmapsCollection = vi.mocked(getRoadmapsCollection);
            
            // Setup: roadmap does not exist
            const mockCollection = {
              findOne: vi.fn().mockResolvedValue(null),
            };
            mockGetRoadmapsCollection.mockResolvedValue(mockCollection as never);

            // Attempt to update objective visibility
            await expect(
              updateVisibility(
                adminId,
                'objective',
                objectiveId,
                isPublic,
                roadmapSlug,
                milestoneId
              )
            ).rejects.toThrow(VisibilityError);

            try {
              await updateVisibility(
                adminId,
                'objective',
                objectiveId,
                isPublic,
                roadmapSlug,
                milestoneId
              );
            } catch (error) {
              expect(error).toBeInstanceOf(VisibilityError);
              expect((error as VisibilityError).code).toBe(VisibilityErrorCode.PARENT_NOT_FOUND);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('objective visibility change should be rejected when parent milestone does not exist in roadmap', async () => {
      await fc.assert(
        fc.asyncProperty(
          roadmapSlugArb,
          entityIdArb,
          entityIdArb,
          adminIdArb,
          fc.boolean(),
          async (roadmapSlug, milestoneId, objectiveId, adminId, isPublic) => {
            const mockGetRoadmapsCollection = vi.mocked(getRoadmapsCollection);
            
            // Setup: roadmap exists but milestone does not exist in it
            const mockRoadmap = {
              slug: roadmapSlug,
              nodes: [
                { id: 'other-milestone', title: 'Other Milestone' },
              ],
            };
            const mockCollection = {
              findOne: vi.fn().mockResolvedValue(mockRoadmap),
            };
            mockGetRoadmapsCollection.mockResolvedValue(mockCollection as never);

            // Attempt to update objective visibility with non-existent milestone
            await expect(
              updateVisibility(
                adminId,
                'objective',
                objectiveId,
                isPublic,
                roadmapSlug,
                milestoneId
              )
            ).rejects.toThrow(VisibilityError);

            try {
              await updateVisibility(
                adminId,
                'objective',
                objectiveId,
                isPublic,
                roadmapSlug,
                milestoneId
              );
            } catch (error) {
              expect(error).toBeInstanceOf(VisibilityError);
              expect((error as VisibilityError).code).toBe(VisibilityErrorCode.PARENT_NOT_FOUND);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('milestone visibility change should succeed when parent roadmap exists', async () => {
      await fc.assert(
        fc.asyncProperty(
          roadmapSlugArb,
          entityIdArb,
          adminIdArb,
          fc.boolean(),
          async (roadmapSlug, milestoneId, adminId, isPublic) => {
            const mockGetRoadmapsCollection = vi.mocked(getRoadmapsCollection);
            const mockGetVisibility = vi.mocked(getVisibility);
            const mockSetVisibility = vi.mocked(setVisibility);
            
            // Setup: roadmap exists
            const mockRoadmap = {
              slug: roadmapSlug,
              nodes: [{ id: milestoneId, title: 'Test Milestone' }],
            };
            const mockCollection = {
              findOne: vi.fn().mockResolvedValue(mockRoadmap),
            };
            mockGetRoadmapsCollection.mockResolvedValue(mockCollection as never);
            mockGetVisibility.mockResolvedValue(null);
            mockSetVisibility.mockResolvedValue(
              createMockVisibilitySetting('milestone', milestoneId, isPublic, roadmapSlug)
            );

            // Should succeed
            const result = await updateVisibility(
              adminId,
              'milestone',
              milestoneId,
              isPublic,
              roadmapSlug
            );

            expect(result.entityType).toBe('milestone');
            expect(result.entityId).toBe(milestoneId);
            expect(result.isPublic).toBe(isPublic);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('roadmap visibility change should succeed without parent validation', async () => {
      await fc.assert(
        fc.asyncProperty(
          roadmapSlugArb,
          adminIdArb,
          fc.boolean(),
          async (roadmapSlug, adminId, isPublic) => {
            const mockGetVisibility = vi.mocked(getVisibility);
            const mockSetVisibility = vi.mocked(setVisibility);
            
            // Setup: no parent validation needed for roadmaps
            mockGetVisibility.mockResolvedValue(null);
            mockSetVisibility.mockResolvedValue(
              createMockVisibilitySetting('roadmap', roadmapSlug, isPublic)
            );

            // Should succeed without any parent checks
            const result = await updateVisibility(
              adminId,
              'roadmap',
              roadmapSlug,
              isPublic
            );

            expect(result.entityType).toBe('roadmap');
            expect(result.entityId).toBe(roadmapSlug);
            expect(result.isPublic).toBe(isPublic);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * **Feature: roadmap-public-visibility, Property 5: Public Content Filtering**
   * 
   * For any public content request, the returned data should only include entities
   * that are effectively public (considering hierarchical visibility rules).
   * 
   * **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
   */
  describe('Property 5: Public Content Filtering', () => {
    it('getPublicRoadmapBySlug should return null for private roadmaps', async () => {
      // Import the function we need to test
      const { getPublicRoadmapBySlug } = await import('./visibility-service');
      
      await fc.assert(
        fc.asyncProperty(
          roadmapSlugArb,
          async (slug) => {
            const mockGetVisibility = vi.mocked(getVisibility);
            
            // Setup: roadmap is private
            mockGetVisibility.mockImplementation(async (type, id) => {
              if (type === 'roadmap' && id === slug) {
                return createMockVisibilitySetting('roadmap', slug, false);
              }
              return null;
            });

            const result = await getPublicRoadmapBySlug(slug);
            
            // Private roadmap should return null
            expect(result).toBeNull();
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('getPublicRoadmaps should only return roadmaps marked as public', async () => {
      const { getPublicRoadmaps } = await import('./visibility-service');
      const { findPublicEntities, getVisibilityByParent } = await import('@/lib/db/repositories/visibility-repository');
      
      await fc.assert(
        fc.asyncProperty(
          fc.array(roadmapSlugArb, { minLength: 0, maxLength: 5 }),
          async (publicSlugs) => {
            const mockFindPublicEntities = vi.mocked(findPublicEntities);
            const mockGetRoadmapsCollection = vi.mocked(getRoadmapsCollection);
            const mockGetVisibilityByParent = vi.mocked(getVisibilityByParent);
            
            // Setup: return the public slugs
            mockFindPublicEntities.mockResolvedValue(publicSlugs);
            
            // Setup: mock roadmap documents
            const mockRoadmaps = publicSlugs.map(slug => ({
              _id: `roadmap-${slug}`,
              slug,
              title: `Roadmap ${slug}`,
              description: 'Test description',
              category: 'frontend',
              difficulty: 5,
              estimatedHours: 10,
              nodes: [],
              edges: [],
              isActive: true,
            }));
            
            const mockCollection = {
              find: vi.fn().mockReturnValue({
                toArray: vi.fn().mockResolvedValue(mockRoadmaps),
              }),
            };
            mockGetRoadmapsCollection.mockResolvedValue(mockCollection as never);
            mockGetVisibilityByParent.mockResolvedValue([]);

            const result = await getPublicRoadmaps();
            
            // Should return exactly the public roadmaps
            expect(result.length).toBe(publicSlugs.length);
            for (const roadmap of result) {
              expect(publicSlugs).toContain(roadmap.slug);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('filtered roadmap should only contain public milestones', async () => {
      const { getPublicRoadmapBySlug } = await import('./visibility-service');
      const { getVisibilityByParent } = await import('@/lib/db/repositories/visibility-repository');
      
      await fc.assert(
        fc.asyncProperty(
          roadmapSlugArb,
          fc.array(entityIdArb, { minLength: 1, maxLength: 5 }),
          fc.array(fc.boolean(), { minLength: 1, maxLength: 5 }),
          async (slug, milestoneIds, milestoneVisibilities) => {
            // Ensure arrays are same length
            const ids = milestoneIds.slice(0, milestoneVisibilities.length);
            const visibilities = milestoneVisibilities.slice(0, ids.length);
            
            if (ids.length === 0) return true;
            
            const mockGetVisibility = vi.mocked(getVisibility);
            const mockGetRoadmapsCollection = vi.mocked(getRoadmapsCollection);
            const mockGetVisibilityByParent = vi.mocked(getVisibilityByParent);
            
            // Setup: roadmap is public
            mockGetVisibility.mockImplementation(async (type, id) => {
              if (type === 'roadmap' && id === slug) {
                return createMockVisibilitySetting('roadmap', slug, true);
              }
              return null;
            });
            
            // Setup: mock roadmap with milestones
            const mockRoadmap = {
              _id: `roadmap-${slug}`,
              slug,
              title: `Roadmap ${slug}`,
              description: 'Test description',
              category: 'frontend',
              difficulty: 5,
              estimatedHours: 10,
              nodes: ids.map((id, i) => ({
                id,
                title: `Milestone ${i}`,
                type: 'milestone',
                position: { x: 0, y: i * 100 },
                learningObjectives: [],
                resources: [],
                estimatedMinutes: 30,
                tags: [],
              })),
              edges: [],
              isActive: true,
            };
            
            const mockCollection = {
              findOne: vi.fn().mockResolvedValue(mockRoadmap),
            };
            mockGetRoadmapsCollection.mockResolvedValue(mockCollection as never);
            
            // Setup: milestone visibility settings
            const milestoneSettings = ids.map((id, i) => 
              createMockVisibilitySetting('milestone', id, visibilities[i], slug)
            );
            mockGetVisibilityByParent.mockImplementation(async (type) => {
              if (type === 'milestone') {
                return milestoneSettings;
              }
              return [];
            });

            const result = await getPublicRoadmapBySlug(slug);
            
            if (result) {
              // All returned nodes should be from public milestones
              const publicMilestoneIds = ids.filter((_, i) => visibilities[i]);
              expect(result.nodes.length).toBe(publicMilestoneIds.length);
              for (const node of result.nodes) {
                expect(publicMilestoneIds).toContain(node.id);
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * **Feature: roadmap-public-visibility, Property 7: Generic Visibility Check**
   * 
   * For any entity type and identifier, the visibility check function should correctly
   * determine the effective visibility based on the entity's setting and its parent hierarchy.
   * 
   * **Validates: Requirements 7.2**
   */
  describe('Property 7: Generic Visibility Check', () => {
    it('isPubliclyVisible should work correctly for roadmap entity type', async () => {
      await fc.assert(
        fc.asyncProperty(
          roadmapSlugArb,
          fc.boolean(),
          async (slug, isPublic) => {
            const mockGetVisibility = vi.mocked(getVisibility);
            
            mockGetVisibility.mockImplementation(async (type, id) => {
              if (type === 'roadmap' && id === slug) {
                return createMockVisibilitySetting('roadmap', slug, isPublic);
              }
              return null;
            });

            const result = await isPubliclyVisible('roadmap', slug);
            
            // Roadmap visibility should match its direct setting
            expect(result).toBe(isPublic);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('isPubliclyVisible should work correctly for milestone entity type', async () => {
      await fc.assert(
        fc.asyncProperty(
          roadmapSlugArb,
          entityIdArb,
          fc.boolean(),
          fc.boolean(),
          async (roadmapSlug, milestoneId, roadmapPublic, milestonePublic) => {
            const mockGetVisibility = vi.mocked(getVisibility);
            
            mockGetVisibility.mockImplementation(async (type, id) => {
              if (type === 'roadmap' && id === roadmapSlug) {
                return createMockVisibilitySetting('roadmap', roadmapSlug, roadmapPublic);
              }
              if (type === 'milestone' && id === milestoneId) {
                return createMockVisibilitySetting('milestone', milestoneId, milestonePublic, roadmapSlug);
              }
              return null;
            });

            const result = await isPubliclyVisible('milestone', milestoneId);
            
            // Milestone is public only if both it and its parent roadmap are public
            const expectedResult = roadmapPublic && milestonePublic;
            expect(result).toBe(expectedResult);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('isPubliclyVisible should work correctly for objective entity type', async () => {
      await fc.assert(
        fc.asyncProperty(
          roadmapSlugArb,
          entityIdArb,
          entityIdArb,
          fc.boolean(),
          fc.boolean(),
          fc.boolean(),
          async (roadmapSlug, milestoneId, objectiveId, roadmapPublic, milestonePublic, objectivePublic) => {
            const mockGetVisibility = vi.mocked(getVisibility);
            
            mockGetVisibility.mockImplementation(async (type, id) => {
              if (type === 'roadmap' && id === roadmapSlug) {
                return createMockVisibilitySetting('roadmap', roadmapSlug, roadmapPublic);
              }
              if (type === 'milestone' && id === milestoneId) {
                return createMockVisibilitySetting('milestone', milestoneId, milestonePublic, roadmapSlug);
              }
              if (type === 'objective' && id === objectiveId) {
                return createMockVisibilitySetting('objective', objectiveId, objectivePublic, roadmapSlug, milestoneId);
              }
              return null;
            });

            const result = await isPubliclyVisible('objective', objectiveId);
            
            // Objective is public only if it, its milestone, and its roadmap are all public
            const expectedResult = roadmapPublic && milestonePublic && objectivePublic;
            expect(result).toBe(expectedResult);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('isPubliclyVisible should return false for non-existent entities', async () => {
      await fc.assert(
        fc.asyncProperty(
          entityTypeArb,
          entityIdArb,
          async (entityType, entityId) => {
            const mockGetVisibility = vi.mocked(getVisibility);
            
            // No visibility setting exists
            mockGetVisibility.mockResolvedValue(null);

            const result = await isPubliclyVisible(entityType, entityId);
            
            // Non-existent entities should be private by default
            expect(result).toBe(false);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('isPubliclyVisible should return false for entities without parent references', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<EntityType>('milestone', 'objective'),
          entityIdArb,
          async (entityType, entityId) => {
            const mockGetVisibility = vi.mocked(getVisibility);
            
            // Entity is marked public but has no parent reference
            mockGetVisibility.mockImplementation(async (type, id) => {
              if (type === entityType && id === entityId) {
                return {
                  _id: `vis-${entityId}`,
                  entityType,
                  entityId,
                  isPublic: true,
                  // Missing parent references
                  parentRoadmapSlug: undefined,
                  parentMilestoneId: undefined,
                  updatedBy: 'admin-123',
                  updatedAt: new Date(),
                  createdAt: new Date(),
                };
              }
              return null;
            });

            const result = await isPubliclyVisible(entityType, entityId);
            
            // Entities without proper parent references should be private
            expect(result).toBe(false);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: roadmap-public-visibility, Property 6: Audit Log Completeness**
   * 
   * For any visibility modification, the audit log entry should contain the admin user ID,
   * timestamp, previous value, new value, entity type, and entity ID.
   * 
   * **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
   */
  describe('Property 6: Audit Log Completeness', () => {
    it('visibility changes should create complete audit records with all required fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          roadmapSlugArb,
          adminIdArb,
          fc.boolean(), // old value
          fc.boolean(), // new value
          async (roadmapSlug, adminId, oldValue, newValue) => {
            const mockGetVisibility = vi.mocked(getVisibility);
            const mockSetVisibility = vi.mocked(setVisibility);
            const mockLogVisibilityChange = vi.mocked(logVisibilityChange);
            
            // Clear previous calls
            mockLogVisibilityChange.mockClear();
            
            // Setup: existing visibility setting
            mockGetVisibility.mockResolvedValue(
              oldValue ? createMockVisibilitySetting('roadmap', roadmapSlug, oldValue) : null
            );
            mockSetVisibility.mockResolvedValue(
              createMockVisibilitySetting('roadmap', roadmapSlug, newValue)
            );

            // Perform visibility update
            await updateVisibility(adminId, 'roadmap', roadmapSlug, newValue);

            // Verify audit log was called with complete information
            expect(mockLogVisibilityChange).toHaveBeenCalledTimes(1);
            
            const [
              loggedAdminId,
              loggedEntityType,
              loggedEntityId,
              loggedOldValue,
              loggedNewValue,
            ] = mockLogVisibilityChange.mock.calls[0];
            
            // Verify all required fields are present
            // Requirement 6.1: admin user identifier
            expect(loggedAdminId).toBe(adminId);
            
            // Requirement 6.4: entity type and identifier
            expect(loggedEntityType).toBe('roadmap');
            expect(loggedEntityId).toBe(roadmapSlug);
            
            // Requirement 6.3: previous and new visibility values
            expect(loggedOldValue).toBe(oldValue ? oldValue : null);
            expect(loggedNewValue).toBe(newValue);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('milestone visibility changes should include parent roadmap in audit log', async () => {
      await fc.assert(
        fc.asyncProperty(
          roadmapSlugArb,
          entityIdArb,
          adminIdArb,
          fc.boolean(),
          async (roadmapSlug, milestoneId, adminId, newValue) => {
            const mockGetVisibility = vi.mocked(getVisibility);
            const mockSetVisibility = vi.mocked(setVisibility);
            const mockGetRoadmapsCollection = vi.mocked(getRoadmapsCollection);
            const mockLogVisibilityChange = vi.mocked(logVisibilityChange);
            
            // Clear previous calls
            mockLogVisibilityChange.mockClear();
            
            // Setup: roadmap exists
            const mockRoadmap = {
              slug: roadmapSlug,
              nodes: [{ id: milestoneId, title: 'Test Milestone' }],
            };
            const mockCollection = {
              findOne: vi.fn().mockResolvedValue(mockRoadmap),
            };
            mockGetRoadmapsCollection.mockResolvedValue(mockCollection as never);
            
            mockGetVisibility.mockResolvedValue(null);
            mockSetVisibility.mockResolvedValue(
              createMockVisibilitySetting('milestone', milestoneId, newValue, roadmapSlug)
            );

            // Perform visibility update
            await updateVisibility(adminId, 'milestone', milestoneId, newValue, roadmapSlug);

            // Verify audit log includes parent roadmap slug
            expect(mockLogVisibilityChange).toHaveBeenCalledTimes(1);
            
            const callArgs = mockLogVisibilityChange.mock.calls[0];
            expect(callArgs[0]).toBe(adminId); // adminId
            expect(callArgs[1]).toBe('milestone'); // entityType
            expect(callArgs[2]).toBe(milestoneId); // entityId
            expect(callArgs[5]).toBe(roadmapSlug); // parentRoadmapSlug
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('objective visibility changes should include parent milestone and roadmap in audit log', async () => {
      await fc.assert(
        fc.asyncProperty(
          roadmapSlugArb,
          entityIdArb,
          entityIdArb,
          adminIdArb,
          fc.boolean(),
          async (roadmapSlug, milestoneId, objectiveId, adminId, newValue) => {
            const mockGetVisibility = vi.mocked(getVisibility);
            const mockSetVisibility = vi.mocked(setVisibility);
            const mockGetRoadmapsCollection = vi.mocked(getRoadmapsCollection);
            const mockLogVisibilityChange = vi.mocked(logVisibilityChange);
            
            // Clear previous calls
            mockLogVisibilityChange.mockClear();
            
            // Setup: roadmap with milestone exists
            const mockRoadmap = {
              slug: roadmapSlug,
              nodes: [{ id: milestoneId, title: 'Test Milestone' }],
            };
            const mockCollection = {
              findOne: vi.fn().mockResolvedValue(mockRoadmap),
            };
            mockGetRoadmapsCollection.mockResolvedValue(mockCollection as never);
            
            mockGetVisibility.mockResolvedValue(null);
            mockSetVisibility.mockResolvedValue(
              createMockVisibilitySetting('objective', objectiveId, newValue, roadmapSlug, milestoneId)
            );

            // Perform visibility update
            await updateVisibility(adminId, 'objective', objectiveId, newValue, roadmapSlug, milestoneId);

            // Verify audit log includes both parent references
            expect(mockLogVisibilityChange).toHaveBeenCalledTimes(1);
            
            const callArgs = mockLogVisibilityChange.mock.calls[0];
            expect(callArgs[0]).toBe(adminId); // adminId
            expect(callArgs[1]).toBe('objective'); // entityType
            expect(callArgs[2]).toBe(objectiveId); // entityId
            expect(callArgs[5]).toBe(roadmapSlug); // parentRoadmapSlug
            expect(callArgs[6]).toBe(milestoneId); // parentMilestoneId
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
