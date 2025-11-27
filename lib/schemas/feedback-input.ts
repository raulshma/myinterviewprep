/**
 * Feedback Input Validation Schemas
 * Separated from server actions to avoid Next.js "use server" restrictions
 */

import { z } from "zod";

/**
 * Schema for creating a feedback entry
 * Requirements: 1.2, 1.3
 */
export const CreateFeedbackInputSchema = z.object({
  interviewId: z.string().min(1, "Interview ID is required"),
  question: z
    .string()
    .min(10, "Question must be at least 10 characters")
    .refine(
      (val) => val.trim().length >= 10,
      "Question cannot be empty or only whitespace"
    ),
  attemptedAnswer: z.string().optional(),
  difficultyRating: z
    .number()
    .int()
    .min(1, "Difficulty must be at least 1")
    .max(5, "Difficulty must be at most 5"),
  topicHints: z.array(z.string()).default([]),
});

export type CreateFeedbackInput = z.infer<typeof CreateFeedbackInputSchema>;

/**
 * Input for recording activity completion
 */
export const RecordActivityCompletionInputSchema = z.object({
  activityId: z.string().min(1, "Activity ID is required"),
  skillCluster: z.string().min(1, "Skill cluster is required"),
  score: z.number().min(0).max(100).optional(),
  timeSpentMs: z.number().int().min(0).optional(),
});

export type RecordActivityCompletionInput = z.infer<
  typeof RecordActivityCompletionInputSchema
>;
