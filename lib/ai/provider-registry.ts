/**
 * Provider Registry
 * Central registry for managing provider instances and caching
 */

import type { AIProviderAdapter, AIProviderType, AIModelMetadata, GroupedAIModels } from './types';
import { OpenRouterAdapter } from './providers/openrouter';
import { GoogleAdapter, GOOGLE_MODELS } from './providers/google';
import { getProviderApiKey } from './provider-factory';

// Cache for model listings
interface ModelCache {
  models: AIModelMetadata[];
  timestamp: number;
}

const MODEL_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

class ProviderRegistry {
  private adapters = new Map<string, AIProviderAdapter>();
  private modelCache = new Map<AIProviderType, ModelCache>();

  /**
   * Get or create an adapter for a provider with specific API key
   */
  getAdapter(type: AIProviderType, apiKey: string): AIProviderAdapter {
    const cacheKey = `${type}:${apiKey.slice(0, 8)}`;
    
    let adapter = this.adapters.get(cacheKey);
    if (!adapter) {
      adapter = this.createAdapter(type, apiKey);
      this.adapters.set(cacheKey, adapter);
    }
    
    return adapter;
  }

  /**
   * Get adapter using environment API key
   */
  getDefaultAdapter(type: AIProviderType): AIProviderAdapter {
    const apiKey = getProviderApiKey(type);
    if (!apiKey) {
      throw new Error(`No API key configured for provider: ${type}`);
    }
    return this.getAdapter(type, apiKey);
  }

  /**
   * Create a new adapter instance
   */
  private createAdapter(type: AIProviderType, apiKey: string): AIProviderAdapter {
    switch (type) {
      case 'openrouter':
        return new OpenRouterAdapter(apiKey);
      case 'google':
        return new GoogleAdapter(apiKey);
      default:
        throw new Error(`Unsupported provider: ${type}`);
    }
  }

  /**
   * List models for a provider with caching
   */
  async listModels(type: AIProviderType, forceRefresh = false): Promise<AIModelMetadata[]> {
    const now = Date.now();
    const cached = this.modelCache.get(type);

    if (!forceRefresh && cached && (now - cached.timestamp) < MODEL_CACHE_TTL_MS) {
      return cached.models;
    }

    try {
      // Check for API key first
      const apiKey = getProviderApiKey(type);
      
      // Special case: Google models are static, so we can list them without an API key
      if (!apiKey && type === 'google') {
        const models = GOOGLE_MODELS;
        
        // Cache the result
        this.modelCache.set(type, {
          models,
          timestamp: now,
        });
        
        return models;
      }

      if (!apiKey) {
        throw new Error(`No API key configured for provider: ${type}`);
      }

      const adapter = this.getAdapter(type, apiKey);
      const models = await adapter.listModels();
      
      this.modelCache.set(type, {
        models,
        timestamp: now,
      });

      return models;
    } catch (error) {
      // Return cached data if available, even if stale
      if (cached) {
        console.warn(`Failed to refresh ${type} models, using cached data:`, error);
        return cached.models;
      }
      throw error;
    }
  }

  /**
   * List models from all configured providers
   */
  async listAllModels(forceRefresh = false): Promise<AIModelMetadata[]> {
    const providers: AIProviderType[] = ['openrouter', 'google'];
    const results: AIModelMetadata[] = [];

    for (const provider of providers) {
      try {
        const models = await this.listModels(provider, forceRefresh);
        results.push(...models);
      } catch (error) {
        console.warn(`Failed to list models for ${provider}:`, error);
      }
    }

    return results;
  }

  /**
   * List models grouped by free/paid for a specific provider
   */
  async listGroupedModels(type: AIProviderType, forceRefresh = false): Promise<GroupedAIModels> {
    const models = await this.listModels(type, forceRefresh);
    
    const grouped: GroupedAIModels = {
      free: [],
      paid: [],
    };

    for (const model of models) {
      if (model.pricing.promptPer1M === 0 && model.pricing.completionPer1M === 0) {
        grouped.free.push(model);
      } else {
        grouped.paid.push(model);
      }
    }

    // Sort by name
    grouped.free.sort((a, b) => a.name.localeCompare(b.name));
    grouped.paid.sort((a, b) => a.name.localeCompare(b.name));

    return grouped;
  }

  /**
   * Estimate cost for a request
   */
  async estimateCost(
    type: AIProviderType,
    modelId: string,
    inputTokens: number,
    outputTokens: number
  ): Promise<number> {
    try {
      const adapter = this.getDefaultAdapter(type);
      return await adapter.estimateCost(modelId, inputTokens, outputTokens);
    } catch {
      // Fallback pricing
      return (inputTokens / 1_000_000) * 1.0 + (outputTokens / 1_000_000) * 3.0;
    }
  }

  /**
   * Clear model cache
   */
  clearCache(type?: AIProviderType): void {
    if (type) {
      this.modelCache.delete(type);
    } else {
      this.modelCache.clear();
    }
  }

  /**
   * Get supported provider types
   */
  getSupportedProviders(): AIProviderType[] {
    return ['openrouter', 'google'];
  }
}

// Singleton instance
export const providerRegistry = new ProviderRegistry();
