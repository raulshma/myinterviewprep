/**
 * Unit tests for Build Tools badge functionality
 * Validates Requirements 6.4 - Build Master badge award
 */

import { describe, it, expect } from 'vitest';
import { 
  checkBuildToolsMilestoneBadge, 
  BUILD_TOOLS_LESSON_ID,
  BADGES 
} from './index';

describe('Build Tools Badge', () => {
  describe('BUILD_MASTER badge definition', () => {
    it('should have correct badge properties', () => {
      expect(BADGES.BUILD_MASTER).toBeDefined();
      expect(BADGES.BUILD_MASTER.id).toBe('build-master');
      expect(BADGES.BUILD_MASTER.name).toBe('Build Master');
      expect(BADGES.BUILD_MASTER.description).toBe('Complete the Build Tools lesson at all three levels');
      expect(BADGES.BUILD_MASTER.icon).toBe('🔧');
      expect(BADGES.BUILD_MASTER.category).toBe('mastery');
    });
  });

  describe('checkBuildToolsMilestoneBadge', () => {
    it('should return build-master when all three levels are completed', () => {
      const completedLessons = [
        { lessonId: BUILD_TOOLS_LESSON_ID, experienceLevel: 'beginner' },
        { lessonId: BUILD_TOOLS_LESSON_ID, experienceLevel: 'intermediate' },
        { lessonId: BUILD_TOOLS_LESSON_ID, experienceLevel: 'advanced' },
      ];

      const badge = checkBuildToolsMilestoneBadge(completedLessons);
      expect(badge).toBe('build-master');
    });

    it('should return null when only beginner level is completed', () => {
      const completedLessons = [
        { lessonId: BUILD_TOOLS_LESSON_ID, experienceLevel: 'beginner' },
      ];

      const badge = checkBuildToolsMilestoneBadge(completedLessons);
      expect(badge).toBeNull();
    });

    it('should return null when only two levels are completed', () => {
      const completedLessons = [
        { lessonId: BUILD_TOOLS_LESSON_ID, experienceLevel: 'beginner' },
        { lessonId: BUILD_TOOLS_LESSON_ID, experienceLevel: 'intermediate' },
      ];

      const badge = checkBuildToolsMilestoneBadge(completedLessons);
      expect(badge).toBeNull();
    });

    it('should return null when no lessons are completed', () => {
      const completedLessons: Array<{ lessonId: string; experienceLevel: string }> = [];

      const badge = checkBuildToolsMilestoneBadge(completedLessons);
      expect(badge).toBeNull();
    });

    it('should return null when other lessons are completed', () => {
      const completedLessons = [
        { lessonId: 'css/selectors', experienceLevel: 'beginner' },
        { lessonId: 'css/selectors', experienceLevel: 'intermediate' },
        { lessonId: 'css/selectors', experienceLevel: 'advanced' },
      ];

      const badge = checkBuildToolsMilestoneBadge(completedLessons);
      expect(badge).toBeNull();
    });

    it('should work with mixed lessons including build-tools', () => {
      const completedLessons = [
        { lessonId: 'css/selectors', experienceLevel: 'beginner' },
        { lessonId: BUILD_TOOLS_LESSON_ID, experienceLevel: 'beginner' },
        { lessonId: 'javascript/syntax', experienceLevel: 'intermediate' },
        { lessonId: BUILD_TOOLS_LESSON_ID, experienceLevel: 'intermediate' },
        { lessonId: BUILD_TOOLS_LESSON_ID, experienceLevel: 'advanced' },
      ];

      const badge = checkBuildToolsMilestoneBadge(completedLessons);
      expect(badge).toBe('build-master');
    });

    it('should handle duplicate completions at the same level', () => {
      const completedLessons = [
        { lessonId: BUILD_TOOLS_LESSON_ID, experienceLevel: 'beginner' },
        { lessonId: BUILD_TOOLS_LESSON_ID, experienceLevel: 'beginner' },
        { lessonId: BUILD_TOOLS_LESSON_ID, experienceLevel: 'intermediate' },
        { lessonId: BUILD_TOOLS_LESSON_ID, experienceLevel: 'advanced' },
      ];

      const badge = checkBuildToolsMilestoneBadge(completedLessons);
      expect(badge).toBe('build-master');
    });
  });

  describe('BUILD_TOOLS_LESSON_ID constant', () => {
    it('should have correct lesson ID format', () => {
      expect(BUILD_TOOLS_LESSON_ID).toBe('javascript/build-tools');
    });
  });
});
