import { z } from 'zod';

export const AIActionSchema = z.enum([
  'GENERATE_BRIEF',
  'GENERATE_TOPICS',
  'GENERATE_MCQ',
  'GENERATE_RAPID_FIRE',
  'REGENERATE_ANALOGY',
]);

export const TokenUsageSchema = z.object({
  input: z.number().int().min(0),
  output: z.number().int().min(0),
});

export const AILogSchema = z.object({
  _id: z.string(),
  interviewId: z.string(),
  userId: z.string(),
  action: AIActionSchema,
  model: z.string(),
  prompt: z.string(),
  response: z.string(),
  toolsUsed: z.array(z.string()).default([]),
  searchQueries: z.array(z.string()).default([]),
  tokenUsage: TokenUsageSchema,
  latencyMs: z.number().min(0),
  timestamp: z.date(),
});

export const CreateAILogSchema = AILogSchema.omit({ _id: true });

export type AIAction = z.infer<typeof AIActionSchema>;
export type TokenUsage = z.infer<typeof TokenUsageSchema>;
export type AILog = z.infer<typeof AILogSchema>;
export type CreateAILog = z.infer<typeof CreateAILogSchema>;
