import { z } from 'zod';

// ============================================================================
// Level-specific configuration for three-level lessons
// ============================================================================

export const LevelConfigSchema = z.object({
  estimatedMinutes: z.number().int().min(1),
  xpReward: z.number().int().min(1),
});

export const ThreeLevelConfigSchema = z.object({
  beginner: LevelConfigSchema,
  intermediate: LevelConfigSchema,
  advanced: LevelConfigSchema,
});

// ============================================================================
// Base lesson metadata fields (shared between both formats)
// ============================================================================

const BaseLessonMetadataSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  milestone: z.string().min(1),
  order: z.number().int().min(0),
  sections: z.array(z.string().min(1)).min(1),
  prerequisites: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

// ============================================================================
// Single-Level Lesson Metadata
// Used for EF Core lessons and other comprehensive single-content lessons
// ============================================================================

export const SingleLevelLessonMetadataSchema = BaseLessonMetadataSchema.extend({
  singleLevel: z.literal(true),
  estimatedMinutes: z.number().int().min(1),
  xpReward: z.number().int().min(1),
});

// ============================================================================
// Three-Level Lesson Metadata
// Traditional format with beginner/intermediate/advanced content
// ============================================================================

export const ThreeLevelLessonMetadataSchema = BaseLessonMetadataSchema.extend({
  singleLevel: z.literal(false).optional(),
  levels: ThreeLevelConfigSchema,
});

// ============================================================================
// Union type for all lesson metadata
// ============================================================================

export const LessonMetadataSchema = z.union([
  SingleLevelLessonMetadataSchema,
  ThreeLevelLessonMetadataSchema,
]);

// ============================================================================
// Type exports
// ============================================================================

export type LevelConfig = z.infer<typeof LevelConfigSchema>;
export type ThreeLevelConfig = z.infer<typeof ThreeLevelConfigSchema>;
export type SingleLevelLessonMetadata = z.infer<typeof SingleLevelLessonMetadataSchema>;
export type ThreeLevelLessonMetadata = z.infer<typeof ThreeLevelLessonMetadataSchema>;
export type LessonMetadata = z.infer<typeof LessonMetadataSchema>;

// ============================================================================
// Type guard functions
// ============================================================================

/**
 * Type guard to check if lesson metadata is single-level format
 * Single-level lessons have singleLevel: true and top-level estimatedMinutes/xpReward
 */
export function isSingleLevelLesson(
  metadata: LessonMetadata
): metadata is SingleLevelLessonMetadata {
  return metadata.singleLevel === true;
}

/**
 * Type guard to check if lesson metadata is three-level format
 * Three-level lessons have a levels object with beginner/intermediate/advanced configs
 */
export function isThreeLevelLesson(
  metadata: LessonMetadata
): metadata is ThreeLevelLessonMetadata {
  return metadata.singleLevel !== true && 'levels' in metadata;
}

// ============================================================================
// Validation functions
// ============================================================================

/**
 * Validate and parse lesson metadata from unknown input
 * Returns the parsed metadata or null if validation fails
 */
export function validateLessonMetadata(data: unknown): LessonMetadata | null {
  const result = LessonMetadataSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Validate single-level lesson metadata specifically
 * Returns the parsed metadata or null if validation fails
 */
export function validateSingleLevelMetadata(
  data: unknown
): SingleLevelLessonMetadata | null {
  const result = SingleLevelLessonMetadataSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Validate three-level lesson metadata specifically
 * Returns the parsed metadata or null if validation fails
 */
export function validateThreeLevelMetadata(
  data: unknown
): ThreeLevelLessonMetadata | null {
  const result = ThreeLevelLessonMetadataSchema.safeParse(data);
  return result.success ? result.data : null;
}
