import { z } from 'zod';
import { 
  SkillClusterSchema, 
  ActivityTypeSchema, 
  DifficultyLevelSchema,
  ActivityContentSchema 
} from './learning-path';

// ============================================================================
// Feedback Entry Schema
// ============================================================================

/**
 * A single feedback entry representing a question the user struggled with
 * during an interview.
 */
export const FeedbackEntrySchema = z.object({
  _id: z.string(),
  interviewId: z.string(),
  userId: z.string(),
  question: z.string().min(10, 'Question must be at least 10 characters'),
  attemptedAnswer: z.string().optional(),
  difficultyRating: z.number().int().min(1).max(5),
  topicHints: z.array(z.string()).default([]),
  // Analysis results (populated after AI analysis)
  skillClusters: z.array(SkillClusterSchema).default([]),
  analysisConfidence: z.number().min(0).max(1).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateFeedbackEntrySchema = FeedbackEntrySchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
  skillClusters: true,
  analysisConfidence: true,
});

// ============================================================================
// Skill Gap and Weakness Analysis Schemas
// ============================================================================

/**
 * Represents a skill gap identified from feedback analysis.
 */
export const SkillGapSchema = z.object({
  skillCluster: SkillClusterSchema,
  gapScore: z.number().min(0).max(100), // Higher = bigger gap
  frequency: z.number().int().min(1),
  confidence: z.number().min(0).max(1),
  relatedFeedbackIds: z.array(z.string()),
});

/**
 * Aggregated weakness analysis for a user based on their feedback entries.
 */
export const WeaknessAnalysisSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  skillGaps: z.array(SkillGapSchema),
  lastAnalyzedAt: z.date(),
  totalFeedbackCount: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
});


// ============================================================================
// Improvement Plan Schemas
// ============================================================================

/**
 * Status of an improvement activity.
 */
export const ImprovementActivityStatusSchema = z.enum([
  'pending',
  'in_progress',
  'completed',
]);

/**
 * An improvement activity targeting a specific skill gap.
 */
export const ImprovementActivitySchema = z.object({
  id: z.string(),
  skillGapId: z.string(),
  skillCluster: SkillClusterSchema,
  activityType: ActivityTypeSchema,
  difficulty: DifficultyLevelSchema,
  content: ActivityContentSchema.nullable(),
  status: ImprovementActivityStatusSchema,
  completedAt: z.date().optional(),
});

/**
 * Progress tracking for skill improvements.
 */
export const SkillProgressSchema = z.record(SkillClusterSchema, z.number());

/**
 * An improvement plan containing activities to address skill gaps.
 */
export const ImprovementPlanSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  skillGaps: z.array(SkillGapSchema),
  activities: z.array(ImprovementActivitySchema),
  progress: z.object({
    totalActivities: z.number().int(),
    completedActivities: z.number().int(),
    skillProgress: SkillProgressSchema,
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================================================
// Progress History Schemas
// ============================================================================

/**
 * A single progress entry tracking skill improvement over time.
 */
export const ProgressEntrySchema = z.object({
  skillCluster: SkillClusterSchema,
  gapScoreBefore: z.number(),
  gapScoreAfter: z.number(),
  activitiesCompleted: z.number().int(),
  timestamp: z.date(),
});

/**
 * Historical progress data for a user.
 */
export const ProgressHistorySchema = z.object({
  userId: z.string(),
  entries: z.array(ProgressEntrySchema),
});

// ============================================================================
// Type Exports
// ============================================================================

export type FeedbackEntry = z.infer<typeof FeedbackEntrySchema>;
export type CreateFeedbackEntry = z.infer<typeof CreateFeedbackEntrySchema>;
export type SkillGap = z.infer<typeof SkillGapSchema>;
export type WeaknessAnalysis = z.infer<typeof WeaknessAnalysisSchema>;
export type ImprovementActivityStatus = z.infer<typeof ImprovementActivityStatusSchema>;
export type ImprovementActivity = z.infer<typeof ImprovementActivitySchema>;
export type SkillProgress = z.infer<typeof SkillProgressSchema>;
export type ImprovementPlan = z.infer<typeof ImprovementPlanSchema>;
export type ProgressEntry = z.infer<typeof ProgressEntrySchema>;
export type ProgressHistory = z.infer<typeof ProgressHistorySchema>;
