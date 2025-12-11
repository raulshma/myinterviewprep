import type { LanguageModel } from 'ai';

/**
 * AI Provider Types
 * Core type definitions for multi-provider AI SDK support
 */

// Supported AI providers
export type AIProviderType = 'openrouter' | 'google';

// Provider configuration interface
export interface AIProviderConfig {
  type: AIProviderType;
  apiKey: string;
  baseURL?: string;
}

// Model pricing structure (per 1M tokens)
export interface AIModelPricing {
  promptPer1M: number;
  completionPer1M: number;
}

// Model capabilities
export interface AIModelCapabilities {
  vision?: boolean;
  tools?: boolean;
  reasoning?: boolean;
  structuredOutput?: boolean;
  webSearch?: boolean;
  imageGeneration?: boolean;
}

// Model metadata interface
export interface AIModelMetadata {
  id: string;
  name: string;
  provider: AIProviderType;
  pricing: AIModelPricing;
  contextLength: number;
  maxOutputTokens?: number;
  defaultTemperature?: number;
  capabilities: AIModelCapabilities;
}

// Grouped models response (matching existing API structure)
export interface GroupedAIModels {
  free: AIModelMetadata[];
  paid: AIModelMetadata[];
}

// Provider adapter interface - each provider must implement this
export interface AIProviderAdapter {
  readonly type: AIProviderType;
  
  /**
   * Get a language model instance by model ID
   */
  getModel(modelId: string): LanguageModel;
  
  /**
   * List all available models from this provider
   */
  listModels(): Promise<AIModelMetadata[]>;
  
  /**
   * Estimate cost for a request
   */
  estimateCost(modelId: string, inputTokens: number, outputTokens: number): Promise<number>;
}

// Provider display information for UI
export const PROVIDER_INFO: Record<AIProviderType, { 
  name: string; 
  icon: string;
  description: string;
  docsUrl: string;
}> = {
  openrouter: { 
    name: 'OpenRouter', 
    icon: '🌐',
    description: 'Access 200+ AI models through a unified API',
    docsUrl: 'https://openrouter.ai/docs',
  },
  google: { 
    name: 'Google AI', 
    icon: '🔷',
    description: 'Google Gemini models with advanced capabilities',
    docsUrl: 'https://ai.google.dev/docs',
  },
};

// Default provider for backwards compatibility
export const DEFAULT_PROVIDER: AIProviderType = 'openrouter';

// Helper to check if a provider type is valid
export function isValidProvider(type: string): type is AIProviderType {
  return type === 'openrouter' || type === 'google';
}

// Helper to get provider display name
export function getProviderDisplayName(type: AIProviderType): string {
  return PROVIDER_INFO[type]?.name ?? type;
}
