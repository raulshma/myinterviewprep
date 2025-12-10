import { z } from 'zod';

/**
 * BYOK (Bring Your Own Key) User Configuration Schema
 * Stores user-specific model tier configuration linked to their API keys
 * Supports multiple providers: OpenRouter, Google Generative AI
 */

// Provider type enum for validation
const AIProviderTypeSchema = z.enum(['openrouter', 'google']);

export const BYOKTierConfigSchema = z.object({
  provider: AIProviderTypeSchema.default('openrouter'),
  model: z.string(),
  fallback: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().int().min(1).default(4096),
});

export const BYOKUserConfigSchema = z.object({
  high: BYOKTierConfigSchema.optional(),
  medium: BYOKTierConfigSchema.optional(),
  low: BYOKTierConfigSchema.optional(),
});

export type BYOKTierConfig = z.infer<typeof BYOKTierConfigSchema>;
export type BYOKUserConfig = z.infer<typeof BYOKUserConfigSchema>;


/**
 * BYOK API Usage Stats (aggregated from AI logs)
 */
export interface BYOKUsageStats {
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  avgLatencyMs: number;
  errorCount: number;
  errorRate: number;
  byAction: Array<{
    action: string;
    count: number;
    inputTokens: number;
    outputTokens: number;
    cost: number;
  }>;
  byModel: Array<{
    model: string;
    count: number;
    inputTokens: number;
    outputTokens: number;
    cost: number;
  }>;
  recentActivity: Array<{
    timestamp: string;
    action: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    latencyMs: number;
    status: string;
  }>;
}
