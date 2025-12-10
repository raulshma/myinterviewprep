/**
 * OpenRouter Provider Adapter
 * Wraps the existing OpenRouter implementation with the provider interface
 */

import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import type { AIProviderAdapter, AIModelMetadata, AIModelCapabilities } from '../types';

// OpenRouter API response types
interface OpenRouterAPIModel {
  id: string;
  name: string;
  description?: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
  architecture?: {
    modality?: string;
    tokenizer?: string;
    instruct_type?: string;
  };
  top_provider?: {
    max_completion_tokens?: number;
    is_moderated?: boolean;
  };
  default_parameters?: {
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
  };
  supported_parameters?: string[];
}

export class OpenRouterAdapter implements AIProviderAdapter {
  readonly type = 'openrouter' as const;
  private client: ReturnType<typeof createOpenRouter>;
  private apiKey: string;

  constructor(apiKey: string, baseURL?: string) {
    this.apiKey = apiKey;
    this.client = createOpenRouter({ apiKey, baseURL });
  }

  getModel(modelId: string) {
    return this.client(modelId);
  }

  async listModels(): Promise<AIModelMetadata[]> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      const models: OpenRouterAPIModel[] = data.data || [];

      return models.map((m) => this.mapToMetadata(m));
    } catch (error) {
      console.error('Failed to fetch OpenRouter models:', error);
      return [];
    }
  }

  async estimateCost(modelId: string, inputTokens: number, outputTokens: number): Promise<number> {
    try {
      const models = await this.listModels();
      const model = models.find((m) => m.id === modelId);
      
      if (!model) {
        // Fallback pricing
        return (inputTokens / 1_000_000) * 1.0 + (outputTokens / 1_000_000) * 3.0;
      }

      return (inputTokens / 1_000_000) * model.pricing.promptPer1M +
             (outputTokens / 1_000_000) * model.pricing.completionPer1M;
    } catch {
      // Default fallback
      return (inputTokens / 1_000_000) * 1.0 + (outputTokens / 1_000_000) * 3.0;
    }
  }

  private mapToMetadata(model: OpenRouterAPIModel): AIModelMetadata {
    const modality = model.architecture?.modality?.toLowerCase() || '';
    const supportedParams = model.supported_parameters || [];

    const capabilities: AIModelCapabilities = {
      vision: modality.includes('image') || modality.includes('multimodal') || modality.includes('vision'),
      tools: supportedParams.includes('tools') || supportedParams.includes('tool_choice'),
      reasoning: supportedParams.includes('reasoning') || supportedParams.includes('include_reasoning'),
      structuredOutput: supportedParams.includes('structured_outputs'),
      webSearch: supportedParams.includes('web_search_options'),
    };

    return {
      id: model.id,
      name: model.name,
      provider: 'openrouter',
      pricing: {
        promptPer1M: parseFloat(model.pricing.prompt) * 1_000_000,
        completionPer1M: parseFloat(model.pricing.completion) * 1_000_000,
      },
      contextLength: model.context_length,
      maxOutputTokens: model.top_provider?.max_completion_tokens,
      defaultTemperature: model.default_parameters?.temperature,
      capabilities,
    };
  }
}

// Singleton instance cache for default API key
let defaultInstance: OpenRouterAdapter | null = null;

export function getOpenRouterAdapter(apiKey?: string): OpenRouterAdapter {
  const key = apiKey || process.env.OPENROUTER_API_KEY;
  
  if (!key) {
    throw new Error('OpenRouter API key is required');
  }

  // Return cached instance if using default key
  if (!apiKey && defaultInstance) {
    return defaultInstance;
  }

  const adapter = new OpenRouterAdapter(key);
  
  if (!apiKey) {
    defaultInstance = adapter;
  }

  return adapter;
}
