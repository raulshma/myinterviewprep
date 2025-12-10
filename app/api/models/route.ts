import { NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/utils/rate-limit';
import type { AIProviderType, AIModelMetadata, GroupedAIModels } from '@/lib/ai/types';
import { isValidProvider } from '@/lib/ai/types';
import { providerRegistry } from '@/lib/ai/provider-registry';

/**
 * OpenRouter model structure (for backwards compatibility export)
 */
export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  provider?: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
  architecture?: {
    modality: string;
    tokenizer: string;
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
  per_request_limits?: {
    prompt_tokens?: string;
    completion_tokens?: string;
  };
  supported_parameters?: string[];
}

/**
 * Grouped models structure (backwards compatible)
 */
export interface GroupedModels {
  free: OpenRouterModel[];
  paid: OpenRouterModel[];
}

/**
 * Multi-provider response structure
 */
export interface MultiProviderModelsResponse {
  provider: AIProviderType;
  models: GroupedAIModels;
}

/**
 * Convert AIModelMetadata to OpenRouterModel format for backwards compatibility
 */
function toOpenRouterFormat(model: AIModelMetadata): OpenRouterModel {
  const supportedParams: string[] = [];
  if (model.capabilities.vision) supportedParams.push('vision');
  if (model.capabilities.tools) supportedParams.push('tools', 'tool_choice');
  if (model.capabilities.reasoning) supportedParams.push('reasoning');
  if (model.capabilities.structuredOutput) supportedParams.push('structured_outputs');
  if (model.capabilities.webSearch) supportedParams.push('web_search_options');

  return {
    id: model.id,
    name: model.name,
    provider: model.provider,
    pricing: {
      prompt: String(model.pricing.promptPer1M / 1_000_000),
      completion: String(model.pricing.completionPer1M / 1_000_000),
    },
    context_length: model.contextLength,
    top_provider: {
      max_completion_tokens: model.maxOutputTokens,
    },
    default_parameters: {
      temperature: model.defaultTemperature,
    },
    supported_parameters: supportedParams,
  };
}

export async function GET(request: Request) {
  // Rate limit by client IP
  const clientIp = getClientIp(request);
  const rateLimitResult = await rateLimit(`api:models:${clientIp}`, {
    maxRequests: 30,
    windowSeconds: 60,
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimitResult.resetInSeconds),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateLimitResult.resetInSeconds),
        },
      }
    );
  }

  try {
    // Get provider from query parameter (default to openrouter for backwards compatibility)
    const { searchParams } = new URL(request.url);
    const providerParam = searchParams.get('provider') || 'openrouter';
    const format = searchParams.get('format') || 'legacy'; // 'legacy' or 'v2'
    
    // Validate provider
    if (!isValidProvider(providerParam)) {
      return NextResponse.json(
        { error: `Invalid provider: ${providerParam}. Valid providers: openrouter, google` },
        { status: 400 }
      );
    }

    const provider = providerParam as AIProviderType;

    // Get grouped models from registry
    const grouped = await providerRegistry.listGroupedModels(provider);

    // Return in v2 format if requested
    if (format === 'v2') {
      const response: MultiProviderModelsResponse = {
        provider,
        models: grouped,
      };
      return NextResponse.json(response);
    }

    // Legacy format: convert to OpenRouterModel format for backwards compatibility
    const legacyGrouped: GroupedModels = {
      free: grouped.free.map(toOpenRouterFormat),
      paid: grouped.paid.map(toOpenRouterFormat),
    };

    // Sort by name within each group
    legacyGrouped.free.sort((a, b) => a.name.localeCompare(b.name));
    legacyGrouped.paid.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(legacyGrouped);
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}
