/**
 * Provider Pricing Service
 * Multi-provider pricing with caching and cost estimation
 * Supports OpenRouter (dynamic) and Google Generative AI (static)
 */

import type { AIProviderType } from '@/lib/ai/types';
import { GOOGLE_PRICING } from '@/lib/ai/providers/google';

interface ModelPricing {
  input: number;  // Price per 1M tokens
  output: number; // Price per 1M tokens
}

// Cache for OpenRouter model pricing
let openRouterPricingCache: Map<string, ModelPricing> | null = null;
let openRouterCacheTimestamp: number = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Fallback pricing for when API is unavailable (per 1M tokens)
const FALLBACK_PRICING: Record<string, ModelPricing> = {
  // OpenRouter models
  'anthropic/claude-sonnet-4': { input: 3.0, output: 15.0 },
  'anthropic/claude-3.5-sonnet': { input: 3.0, output: 15.0 },
  'anthropic/claude-3-opus': { input: 15.0, output: 75.0 },
  'anthropic/claude-3-haiku': { input: 0.25, output: 1.25 },
  'openai/gpt-4o': { input: 2.5, output: 10.0 },
  'openai/gpt-4o-mini': { input: 0.15, output: 0.6 },
  'openai/gpt-4-turbo': { input: 10.0, output: 30.0 },
  'openai/gpt-3.5-turbo': { input: 0.5, output: 1.5 },
  'google/gemini-pro-1.5': { input: 1.25, output: 5.0 },
  'meta-llama/llama-3.1-70b-instruct': { input: 0.52, output: 0.75 },
};

const DEFAULT_PRICING: ModelPricing = { input: 1.0, output: 3.0 };

/**
 * Detect provider from model ID
 */
export function detectProvider(modelId: string): AIProviderType {
  // Google models typically start with 'gemini-' when used directly with Google API
  if (modelId.startsWith('gemini-')) {
    return 'google';
  }
  // OpenRouter uses format like 'google/gemini-pro' or 'anthropic/claude'
  // If it contains a slash, it's likely OpenRouter format
  if (modelId.includes('/')) {
    return 'openrouter';
  }
  // Default to openrouter for backwards compatibility
  return 'openrouter';
}

/**
 * Convert Google pricing format to ModelPricing
 */
function googleToModelPricing(pricing: { promptPer1M: number; completionPer1M: number }): ModelPricing {
  return {
    input: pricing.promptPer1M,
    output: pricing.completionPer1M,
  };
}

/**
 * Get pricing for a Google model
 */
function getGoogleModelPricing(modelId: string): ModelPricing {
  const pricing = GOOGLE_PRICING[modelId];
  if (pricing) {
    return googleToModelPricing(pricing);
  }
  // Default Google pricing
  return { input: 0.5, output: 1.5 };
}

/**
 * Fetch OpenRouter model pricing from API
 */
async function fetchOpenRouterPricing(): Promise<Map<string, ModelPricing>> {
  const pricingMap = new Map<string, ModelPricing>();
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 900 }, // 15 min cache for Next.js
    });

    if (!response.ok) {
      console.warn(`OpenRouter API returned ${response.status}, using fallback pricing`);
      return new Map(Object.entries(FALLBACK_PRICING));
    }

    const data = await response.json();
    
    for (const model of data.data) {
      const inputPricePerToken = parseFloat(model.pricing.prompt) || 0;
      const outputPricePerToken = parseFloat(model.pricing.completion) || 0;
      
      pricingMap.set(model.id, {
        input: inputPricePerToken * 1_000_000,
        output: outputPricePerToken * 1_000_000,
      });
    }

    return pricingMap;
  } catch (error) {
    console.error('Failed to fetch OpenRouter pricing:', error);
    return new Map(Object.entries(FALLBACK_PRICING));
  }
}

/**
 * Get cached OpenRouter pricing, refreshing if stale
 */
async function getCachedOpenRouterPricing(): Promise<Map<string, ModelPricing>> {
  const now = Date.now();
  
  if (openRouterPricingCache && (now - openRouterCacheTimestamp) < CACHE_TTL_MS) {
    return openRouterPricingCache;
  }
  
  openRouterPricingCache = await fetchOpenRouterPricing();
  openRouterCacheTimestamp = now;
  
  return openRouterPricingCache;
}

/**
 * Get pricing for a model from any provider
 */
export async function getModelPricing(modelId: string, provider?: AIProviderType): Promise<ModelPricing> {
  const detectedProvider = provider ?? detectProvider(modelId);
  
  if (detectedProvider === 'google') {
    return getGoogleModelPricing(modelId);
  }
  
  // OpenRouter
  const pricing = await getCachedOpenRouterPricing();
  return pricing.get(modelId) ?? FALLBACK_PRICING[modelId] ?? DEFAULT_PRICING;
}

/**
 * Estimate cost for a request
 */
export async function estimateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number,
  provider?: AIProviderType
): Promise<number> {
  const pricing = await getModelPricing(modelId, provider);
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000;
}

/**
 * Get all available models with pricing for a provider
 */
export async function getAllModelPricing(provider?: AIProviderType): Promise<Map<string, ModelPricing>> {
  if (provider === 'google') {
    const googlePricing = new Map<string, ModelPricing>();
    for (const [id, pricing] of Object.entries(GOOGLE_PRICING)) {
      googlePricing.set(id, googleToModelPricing(pricing));
    }
    return googlePricing;
  }
  
  return getCachedOpenRouterPricing();
}

/**
 * Force refresh the OpenRouter pricing cache
 */
export async function refreshPricingCache(): Promise<void> {
  openRouterPricingCache = await fetchOpenRouterPricing();
  openRouterCacheTimestamp = Date.now();
}

/**
 * Check if cache is stale
 */
export function isCacheStale(): boolean {
  return !openRouterPricingCache || (Date.now() - openRouterCacheTimestamp) >= CACHE_TTL_MS;
}

/**
 * Get cache info for debugging
 */
export function getCacheInfo(): { 
  isCached: boolean; 
  ageMs: number; 
  modelCount: number;
  expiresInMs: number;
} {
  const now = Date.now();
  const age = openRouterPricingCache ? now - openRouterCacheTimestamp : 0;
  return {
    isCached: !!openRouterPricingCache,
    ageMs: age,
    modelCount: openRouterPricingCache?.size ?? 0,
    expiresInMs: openRouterPricingCache ? Math.max(0, CACHE_TTL_MS - age) : 0,
  };
}
