/**
 * Image Generation Service
 * 
 * Generic service for generating images using AI models.
 * Designed to support multiple providers (Google, OpenAI, etc.)
 * Uses a registry pattern for provider-specific adapters.
 */

import type { AIProviderType } from '@/lib/ai/types';

// ============================================================================
// Types
// ============================================================================

/**
 * Request for image generation
 */
export interface ImageGenerationRequest {
  prompt: string;
  provider: AIProviderType;
  modelId: string;
  apiKey?: string;
  options?: ImageGenerationOptions;
}

/**
 * Options for image generation
 */
export interface ImageGenerationOptions {
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  numberOfImages?: number;
  style?: 'natural' | 'vivid';
}

/**
 * A single generated image
 */
export interface GeneratedImage {
  data: string;  // Base64 encoded image data (without data URL prefix)
  mimeType: string;
  width?: number;
  height?: number;
}

/**
 * Result of image generation
 */
export interface ImageGenerationResult {
  success: boolean;
  images?: GeneratedImage[];
  error?: string;
  textResponse?: string;  // For models that return text alongside images
}

/**
 * Interface for provider-specific image generation adapters
 */
export interface ImageGenerationAdapter {
  /**
   * Generate images from a prompt
   */
  generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult>;
  
  /**
   * Check if a model supports image generation
   */
  supportsImageGeneration(modelId: string): boolean;
}

// ============================================================================
// Registry
// ============================================================================

// Registry of provider adapters
const adapters = new Map<AIProviderType, ImageGenerationAdapter>();

/**
 * Register an image generation adapter for a provider
 */
export function registerImageAdapter(
  provider: AIProviderType, 
  adapter: ImageGenerationAdapter
): void {
  adapters.set(provider, adapter);
}

/**
 * Get the image generation adapter for a provider
 */
export function getImageAdapter(
  provider: AIProviderType
): ImageGenerationAdapter | undefined {
  return adapters.get(provider);
}

/**
 * Check if a provider has an image generation adapter registered
 */
export function hasImageAdapter(provider: AIProviderType): boolean {
  return adapters.has(provider);
}

// ============================================================================
// Main API
// ============================================================================

/**
 * Generate images using the appropriate provider adapter
 */
export async function generateImage(
  request: ImageGenerationRequest
): Promise<ImageGenerationResult> {
  const adapter = adapters.get(request.provider);
  
  if (!adapter) {
    return { 
      success: false, 
      error: `No image generation adapter registered for provider: ${request.provider}` 
    };
  }
  
  if (!adapter.supportsImageGeneration(request.modelId)) {
    return { 
      success: false, 
      error: `Model ${request.modelId} does not support image generation` 
    };
  }
  
  try {
    return await adapter.generateImage(request);
  } catch (error) {
    console.error('Image generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Image generation failed',
    };
  }
}

/**
 * Check if image generation is available for a specific provider and model
 */
export function isImageGenerationAvailable(
  provider: AIProviderType,
  modelId: string
): boolean {
  const adapter = adapters.get(provider);
  return adapter?.supportsImageGeneration(modelId) ?? false;
}

/**
 * Convert base64 image data to a data URL
 */
export function toDataUrl(base64Data: string, mimeType: string): string {
  // If already a data URL, return as-is
  if (base64Data.startsWith('data:')) {
    return base64Data;
  }
  return `data:${mimeType};base64,${base64Data}`;
}

/**
 * Extract base64 data from a data URL
 */
export function fromDataUrl(dataUrl: string): { data: string; mimeType: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return null;
  }
  return {
    mimeType: match[1],
    data: match[2],
  };
}
