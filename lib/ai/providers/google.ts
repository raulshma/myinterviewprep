/**
 * Google Generative AI Provider Adapter
 * Implements the provider interface for Google's Gemini models
 * 
 * Supports Google-specific tools:
 * - googleSearch: Real-time web search grounding
 * - urlContext: Analyze specific URLs
 * - codeExecution: Execute Python code
 */

import { createGoogleGenerativeAI, google as googleProvider } from '@ai-sdk/google';
import type { AIProviderAdapter, AIModelMetadata, AIModelPricing } from '../types';
import type { ProviderToolType } from '../provider-tools';

// Google model pricing (per 1M tokens) - based on official pricing
// https://ai.google.dev/pricing
const GOOGLE_PRICING: Record<string, AIModelPricing> = {
  // Gemini 3 models
  'gemini-3-pro-preview': { promptPer1M: 2.00, completionPer1M: 12.00 }, // <= 200k context
  // Gemini 2.5 models
  'gemini-2.5-pro': { promptPer1M: 1.25, completionPer1M: 10.00 }, // <= 200k context
  'gemini-2.5-flash': { promptPer1M: 0.30, completionPer1M: 2.50 },
  'gemini-2.5-flash-lite': { promptPer1M: 0.075, completionPer1M: 0.30 },
  'gemini-2.5-flash-tts': { promptPer1M: 0.10, completionPer1M: 0.40 },
  'gemini-2.5-flash-image': { promptPer1M: 0.30, completionPer1M: 2.50 }, // Image generation model
  // Gemini 2.0 models
  'gemini-2.0-flash': { promptPer1M: 0.10, completionPer1M: 0.40 },
  'gemini-2.0-flash-lite': { promptPer1M: 0.075, completionPer1M: 0.30 },
};

// Default pricing for unknown models
const DEFAULT_GOOGLE_PRICING: AIModelPricing = { promptPer1M: 0.50, completionPer1M: 1.50 };

// Google available models with metadata
const GOOGLE_MODELS: AIModelMetadata[] = [
  // Gemini 3 Pro - Newest State of the Art
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro (Preview)',
    provider: 'google',
    pricing: GOOGLE_PRICING['gemini-3-pro-preview'],
    contextLength: 1048576, // 1M+ tokens
    maxOutputTokens: 65536,
    defaultTemperature: 1.0,
    capabilities: { 
      vision: true, 
      tools: true, 
      reasoning: true, 
      structuredOutput: true,
    },
  },
  // Gemini 2.5 Pro - Highly Capable
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    pricing: GOOGLE_PRICING['gemini-2.5-pro'],
    contextLength: 1048576,
    maxOutputTokens: 65536,
    defaultTemperature: 1.0,
    capabilities: { 
      vision: true, 
      tools: true, 
      reasoning: true, 
      structuredOutput: true,
    },
  },
  // Gemini 2.5 Flash - Balanced
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    pricing: GOOGLE_PRICING['gemini-2.5-flash'],
    contextLength: 1048576,
    maxOutputTokens: 65536,
    defaultTemperature: 1.0,
    capabilities: { 
      vision: true, 
      tools: true, 
      reasoning: true, 
      structuredOutput: true,
    },
  },
  // Gemini 2.5 Flash Lite - Lightweight Text Model
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    provider: 'google',
    pricing: GOOGLE_PRICING['gemini-2.5-flash-lite'],
    contextLength: 1048576,
    maxOutputTokens: 65536,
    defaultTemperature: 1.0,
    capabilities: { 
      vision: true, 
      tools: true, 
      reasoning: false, 
      structuredOutput: true,
    },
  },
  // Gemini 2.5 Flash TTS - Multi-modal Generative
  {
    id: 'gemini-2.5-flash-tts',
    name: 'Gemini 2.5 Flash TTS',
    provider: 'google',
    pricing: GOOGLE_PRICING['gemini-2.5-flash-tts'],
    contextLength: 1048576,
    maxOutputTokens: 8192,
    defaultTemperature: 1.0,
    capabilities: { 
      vision: true, 
      tools: false, 
      reasoning: false, 
      structuredOutput: false,
    },
  },
  // Gemini 2.0 Flash - Efficient
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    pricing: GOOGLE_PRICING['gemini-2.0-flash'],
    contextLength: 1048576,
    maxOutputTokens: 8192,
    defaultTemperature: 1.0,
    capabilities: { 
      vision: true, 
      tools: true, 
      reasoning: false, 
      structuredOutput: true,
    },
  },
  // Gemini 2.0 Flash Lite - Lightweight
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    provider: 'google',
    pricing: GOOGLE_PRICING['gemini-2.0-flash-lite'],
    contextLength: 1048576,
    maxOutputTokens: 8192,
    defaultTemperature: 1.0,
    capabilities: { 
      vision: true, 
      tools: true, 
      reasoning: false, 
      structuredOutput: true,
    },
  },
  // Gemini 2.5 Flash Preview Image - Image Generation
  {
    id: 'gemini-2.5-flash-image',
    name: 'Gemini 2.5 Flash (Image Gen)',
    provider: 'google',
    pricing: GOOGLE_PRICING['gemini-2.5-flash-image'],
    contextLength: 1048576,
    maxOutputTokens: 8192,
    defaultTemperature: 1.0,
    capabilities: { 
      vision: true, 
      tools: false,  // Image gen models don't support function calling tools
      reasoning: false, 
      structuredOutput: false,
      imageGeneration: true,
    },
  },
];

/**
 * Build Google-specific tools based on enabled tool types
 * Returns tools in a format compatible with Vercel AI SDK's ToolSet
 */
export function buildGoogleTools(enabledTools: ProviderToolType[]) {
  const tools: Record<string, unknown> = {};

  if (enabledTools.includes('googleSearch')) {
    tools.google_search = googleProvider.tools.googleSearch({});
  }

  if (enabledTools.includes('urlContext')) {
    tools.url_context = googleProvider.tools.urlContext({});
  }

  if (enabledTools.includes('codeExecution')) {
    tools.code_execution = googleProvider.tools.codeExecution({});
  }

  return tools;
}

/**
 * Check if any Google-specific tools are enabled
 */
export function hasGoogleTools(enabledTools: ProviderToolType[]): boolean {
  const googleToolTypes: ProviderToolType[] = ['googleSearch', 'urlContext', 'codeExecution'];
  return enabledTools.some(t => googleToolTypes.includes(t));
}

/**
 * Check if image generation is enabled
 */
export function hasImageGeneration(enabledTools: ProviderToolType[]): boolean {
  return enabledTools.includes('imageGeneration');
}

/**
 * Models that support image generation output
 */
export const IMAGE_GENERATION_MODELS = [
  'gemini-2.5-flash-image',
];

export class GoogleAdapter implements AIProviderAdapter {
  readonly type = 'google' as const;
  private client: ReturnType<typeof createGoogleGenerativeAI>;

  constructor(apiKey: string, baseURL?: string) {
    this.client = createGoogleGenerativeAI({ 
      apiKey,
      baseURL,
    });
  }

  getModel(modelId: string) {
    return this.client(modelId);
  }

  /**
   * Get model with Google-specific tools enabled
   */
  getModelWithTools(modelId: string, enabledTools: ProviderToolType[]) {
    // The model itself doesn't change, but we return the tools config
    // The caller should merge these tools with their streamText call
    return {
      model: this.client(modelId),
      tools: buildGoogleTools(enabledTools),
    };
  }

  async listModels(): Promise<AIModelMetadata[]> {
    // Google doesn't have a public API to list models dynamically
    // Return the static list of known models
    return GOOGLE_MODELS;
  }

  async estimateCost(modelId: string, inputTokens: number, outputTokens: number): Promise<number> {
    const pricing = GOOGLE_PRICING[modelId] || DEFAULT_GOOGLE_PRICING;
    
    return (inputTokens / 1_000_000) * pricing.promptPer1M +
           (outputTokens / 1_000_000) * pricing.completionPer1M;
  }
}

// Singleton instance cache for default API key
let defaultInstance: GoogleAdapter | null = null;

export function getGoogleAdapter(apiKey?: string): GoogleAdapter {
  const key = apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  
  if (!key) {
    throw new Error('Google Generative AI API key is required. Set GOOGLE_GENERATIVE_AI_API_KEY environment variable or provide an API key.');
  }

  // Return cached instance if using default key
  if (!apiKey && defaultInstance) {
    return defaultInstance;
  }

  const adapter = new GoogleAdapter(key);
  
  if (!apiKey) {
    defaultInstance = adapter;
  }

  return adapter;
}

// Export model list for use in UI
export { GOOGLE_MODELS, GOOGLE_PRICING };

// Re-export the google provider for direct tool access
export { googleProvider };
