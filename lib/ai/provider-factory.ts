/**
 * Provider Factory
 * Creates provider adapter instances from configuration
 */

import type { AIProviderAdapter, AIProviderType, AIProviderConfig } from './types';
import { DEFAULT_PROVIDER } from './types';
import { OpenRouterAdapter } from './providers/openrouter';
import { GoogleAdapter } from './providers/google';

/**
 * Create a provider adapter instance from configuration
 */
export function createProviderAdapter(config: AIProviderConfig): AIProviderAdapter {
  switch (config.type) {
    case 'openrouter':
      return new OpenRouterAdapter(config.apiKey, config.baseURL);
    case 'google':
      return new GoogleAdapter(config.apiKey, config.baseURL);
    default:
      throw new Error(`Unsupported provider type: ${config.type}`);
  }
}

/**
 * Create a provider adapter by type with API key
 */
export function createProvider(
  type: AIProviderType,
  apiKey: string,
  baseURL?: string
): AIProviderAdapter {
  return createProviderAdapter({ type, apiKey, baseURL });
}

/**
 * Get the API key for a provider from environment variables
 */
export function getProviderApiKey(type: AIProviderType): string | undefined {
  switch (type) {
    case 'openrouter':
      return process.env.OPENROUTER_API_KEY;
    case 'google':
      return process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    default:
      return undefined;
  }
}

/**
 * Get environment variable name for a provider's API key
 */
export function getProviderApiKeyEnvName(type: AIProviderType): string {
  switch (type) {
    case 'openrouter':
      return 'OPENROUTER_API_KEY';
    case 'google':
      return 'GOOGLE_GENERATIVE_AI_API_KEY';
    default:
      return '';
  }
}

/**
 * Check if a provider is configured (has API key available)
 */
export function isProviderConfigured(type: AIProviderType): boolean {
  const apiKey = getProviderApiKey(type);
  return !!apiKey && apiKey.length > 0;
}

/**
 * Get list of all configured providers
 */
export function getConfiguredProviders(): AIProviderType[] {
  const providers: AIProviderType[] = ['openrouter', 'google'];
  return providers.filter(isProviderConfigured);
}

/**
 * Get the default provider (first configured, or fallback)
 */
export function getDefaultProvider(): AIProviderType {
  const configured = getConfiguredProviders();
  return configured.length > 0 ? configured[0] : DEFAULT_PROVIDER;
}

/**
 * Create a provider adapter using environment API key
 * Throws if API key is not configured
 */
export function createDefaultProvider(type: AIProviderType): AIProviderAdapter {
  const apiKey = getProviderApiKey(type);
  
  if (!apiKey) {
    throw new Error(
      `API key not configured for provider "${type}". ` +
      `Set the ${getProviderApiKeyEnvName(type)} environment variable.`
    );
  }

  return createProvider(type, apiKey);
}

/**
 * Create a provider adapter, using BYOK key if provided, else environment key
 */
export function createProviderWithFallback(
  type: AIProviderType,
  byokApiKey?: string
): AIProviderAdapter {
  const apiKey = byokApiKey || getProviderApiKey(type);
  
  if (!apiKey) {
    throw new Error(
      `API key not available for provider "${type}". ` +
      `Provide a BYOK key or set the ${getProviderApiKeyEnvName(type)} environment variable.`
    );
  }

  return createProvider(type, apiKey);
}
