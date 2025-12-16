import { z } from 'zod';

// Experience levels for lessons
export const ExperienceLevelSchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
]);

// Quiz answer record
export const QuizAnswerSchema = z.object({
  questionId: z.string(),
  selectedAnswer: z.string(),
  isCorrect: z.boolean(),
  answeredAt: z.date(),
});

// Section completion record
export const SectionCompletionSchema = z.object({
  sectionId: z.string(),
  completedAt: z.date(),
  xpEarned: z.number().int().min(0).default(0),
});

// Progress for a single lesson
export const LessonProgressSchema = z.object({
  lessonId: z.string().min(1), // e.g., "internet/how-does-internet-work"
  experienceLevel: ExperienceLevelSchema,
  sectionsCompleted: z.array(SectionCompletionSchema).default([]),
  totalSections: z.number().int().min(1),
  quizAnswers: z.array(QuizAnswerSchema).default([]),
  xpEarned: z.number().int().min(0).default(0),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  timeSpentSeconds: z.number().int().min(0).default(0),
});

// Update lesson progress input
export const UpdateLessonProgressSchema = LessonProgressSchema.partial().required({
  lessonId: true,
});

// Export types
export type ExperienceLevel = z.infer<typeof ExperienceLevelSchema>;
export type QuizAnswer = z.infer<typeof QuizAnswerSchema>;
export type SectionCompletion = z.infer<typeof SectionCompletionSchema>;
export type LessonProgress = z.infer<typeof LessonProgressSchema>;
export type UpdateLessonProgress = z.infer<typeof UpdateLessonProgressSchema>;
