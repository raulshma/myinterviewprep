/**
 * Google Image Generation Adapter
 * 
 * Provides information about Google's image generation capabilities.
 * The actual image generation is handled by the AI orchestrator
 * which uses streamText with providerOptions for image generation.
 * 
 * This adapter primarily serves as a capability check and can be
 * extended for standalone image generation use cases.
 */

import { 
  registerImageAdapter,
  type ImageGenerationAdapter, 
  type ImageGenerationRequest, 
  type ImageGenerationResult,
} from '../image-generation';
import { IMAGE_GENERATION_MODELS } from '@/lib/ai/providers/google';

/**
 * Google Image Generation Adapter
 * Supports Gemini models with image generation capabilities
 */
class GoogleImageAdapter implements ImageGenerationAdapter {
  /**
   * Check if a model supports image generation
   */
  supportsImageGeneration(modelId: string): boolean {
    return IMAGE_GENERATION_MODELS.includes(modelId);
  }

  /**
   * Generate images using Gemini's image generation model
   * 
   * Note: For streaming chat, image generation is handled by the AI orchestrator.
   * This method is provided for standalone image generation use cases.
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    // For now, return an informative message
    // The actual streaming image generation happens via the orchestrator's streamText
    // with providerOptions: { google: { responseModalities: ['TEXT', 'IMAGE'] } }
    
    if (!this.supportsImageGeneration(request.modelId)) {
      return {
        success: false,
        error: `Model ${request.modelId} does not support image generation. Use ${IMAGE_GENERATION_MODELS.join(', ')} instead.`,
      };
    }

    // This adapter is primarily for capability checking
    // Actual generation in chat context is handled by the orchestrator
    return {
      success: false,
      error: 'Standalone image generation is not yet implemented. Use the AI chat with image generation enabled.',
    };
  }
}

// Create and register the adapter
const googleImageAdapter = new GoogleImageAdapter();
registerImageAdapter('google', googleImageAdapter);

// Export for testing
export { GoogleImageAdapter, googleImageAdapter };
