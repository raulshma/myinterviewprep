/**
 * AI Provider Module
 * Public exports for multi-provider AI SDK support
 */

// Core types
export type {
  AIProviderType,
  AIProviderConfig,
  AIProviderAdapter,
  AIModelMetadata,
  AIModelPricing,
  AIModelCapabilities,
  GroupedAIModels,
} from './types';

export {
  PROVIDER_INFO,
  DEFAULT_PROVIDER,
  isValidProvider,
  getProviderDisplayName,
} from './types';

// Provider factory
export {
  createProviderAdapter,
  createProvider,
  createDefaultProvider,
  createProviderWithFallback,
  getProviderApiKey,
  getProviderApiKeyEnvName,
  isProviderConfigured,
  getConfiguredProviders,
  getDefaultProvider,
} from './provider-factory';

// Provider registry
export { providerRegistry } from './provider-registry';

// Provider adapters (for direct use if needed)
export { OpenRouterAdapter, getOpenRouterAdapter } from './providers/openrouter';
export { 
  GoogleAdapter, 
  getGoogleAdapter, 
  GOOGLE_MODELS, 
  GOOGLE_PRICING,
  buildGoogleTools,
  hasGoogleTools,
  hasImageGeneration,
  IMAGE_GENERATION_MODELS,
  googleProvider,
} from './providers/google';

// Provider tools configuration
export {
  PROVIDER_TOOLS,
  getProviderTools,
  getModelTools,
  isToolAvailable,
  getDefaultEnabledTools,
  validateToolSelection,
  type ProviderToolType,
  type ProviderToolDefinition,
  type ProviderToolsConfig,
  type ProviderToolsState,
} from './provider-tools';
