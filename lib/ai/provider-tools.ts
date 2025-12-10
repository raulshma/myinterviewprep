/**
 * Provider Tools Configuration
 * 
 * Defines provider-specific tools that can be enabled/disabled by users.
 * This is extensible - new providers can add their own tools by adding
 * entries to the PROVIDER_TOOLS registry.
 */

import type { AIProviderType } from './types';

/**
 * Tool capability types that providers can offer
 */
export type ProviderToolType = 
  | 'googleSearch'      // Google Search grounding
  | 'urlContext'        // URL context analysis
  | 'codeExecution'     // Code execution (Python)
  | 'imageGeneration'   // Image output generation
  | 'fileInput';        // File/image input support

/**
 * Definition of a provider-specific tool
 */
export interface ProviderToolDefinition {
  id: ProviderToolType;
  name: string;
  description: string;
  icon: string;  // Lucide icon name
  /** Models that support this tool (empty = all models) */
  supportedModels?: string[];
  /** Models that don't support this tool */
  excludedModels?: string[];
  /** Whether this tool is enabled by default */
  defaultEnabled: boolean;
  /** Whether this tool requires specific model capabilities */
  requiresCapability?: keyof import('./types').AIModelCapabilities;
}

/**
 * Provider tools configuration
 */
export interface ProviderToolsConfig {
  provider: AIProviderType;
  tools: ProviderToolDefinition[];
}

/**
 * Registry of provider-specific tools
 * Add new providers here to extend the system
 */
export const PROVIDER_TOOLS: Record<AIProviderType, ProviderToolDefinition[]> = {
  google: [
    {
      id: 'fileInput',
      name: 'File Input',
      description: 'Attach images and files to your messages for analysis',
      icon: 'ImagePlus',
      defaultEnabled: true,
      requiresCapability: 'vision',
    },
    {
      id: 'googleSearch',
      name: 'Google Search',
      description: 'Enable real-time web search grounding for up-to-date information',
      icon: 'Search',
      defaultEnabled: false,
      // Supported on most Gemini 2.0+ models
      supportedModels: [
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite',
        'gemini-2.5-pro',
        'gemini-2.5-flash',
        'gemini-2.5-flash-lite',
        'gemini-3-pro-preview',
      ],
    },
    {
      id: 'urlContext',
      name: 'URL Context',
      description: 'Analyze specific URLs and web pages in your prompts',
      icon: 'Link',
      defaultEnabled: false,
      supportedModels: [
        'gemini-2.0-flash',
        'gemini-2.5-pro',
        'gemini-2.5-flash',
        'gemini-3-pro-preview',
      ],
    },
    {
      id: 'codeExecution',
      name: 'Code Execution',
      description: 'Execute Python code for calculations and data processing',
      icon: 'Code',
      defaultEnabled: false,
      supportedModels: [
        'gemini-2.5-pro',
        'gemini-2.5-flash',
        'gemini-3-pro-preview',
      ],
    },
    {
      id: 'imageGeneration',
      name: 'Image Output',
      description: 'Generate images from text descriptions',
      icon: 'Sparkles',
      defaultEnabled: false,
      // Only specific image-capable models
      supportedModels: [
        'gemini-2.5-flash-image-preview',
      ],
    },
  ],
  openrouter: [
    // OpenRouter tools are handled differently - through the model's native capabilities
    // File input is supported based on model's vision capability
    {
      id: 'fileInput',
      name: 'File Input',
      description: 'Attach images to your messages (requires vision-capable model)',
      icon: 'ImagePlus',
      defaultEnabled: true,
      requiresCapability: 'vision',
    },
  ],
};

/**
 * Get available tools for a specific provider
 */
export function getProviderTools(provider: AIProviderType): ProviderToolDefinition[] {
  return PROVIDER_TOOLS[provider] || [];
}

/**
 * Get tools available for a specific model
 */
export function getModelTools(
  provider: AIProviderType,
  modelId: string
): ProviderToolDefinition[] {
  const providerTools = getProviderTools(provider);
  
  return providerTools.filter(tool => {
    // If no model restrictions, tool is available
    if (!tool.supportedModels && !tool.excludedModels) {
      return true;
    }
    
    // Check exclusions first
    if (tool.excludedModels?.includes(modelId)) {
      return false;
    }
    
    // Check if model is in supported list
    if (tool.supportedModels && !tool.supportedModels.includes(modelId)) {
      return false;
    }
    
    return true;
  });
}

/**
 * Check if a specific tool is available for a model
 */
export function isToolAvailable(
  provider: AIProviderType,
  modelId: string,
  toolId: ProviderToolType
): boolean {
  const tools = getModelTools(provider, modelId);
  return tools.some(t => t.id === toolId);
}

/**
 * Get default enabled tools for a model
 */
export function getDefaultEnabledTools(
  provider: AIProviderType,
  modelId: string
): ProviderToolType[] {
  const tools = getModelTools(provider, modelId);
  return tools.filter(t => t.defaultEnabled).map(t => t.id);
}

/**
 * User's tool selection state
 */
export interface ProviderToolsState {
  provider: AIProviderType;
  modelId: string;
  enabledTools: ProviderToolType[];
}

/**
 * Validate and normalize tool selection
 * Ensures only valid tools for the model are enabled
 */
export function validateToolSelection(
  provider: AIProviderType,
  modelId: string,
  selectedTools: ProviderToolType[]
): ProviderToolType[] {
  const availableTools = getModelTools(provider, modelId);
  const availableIds = new Set(availableTools.map(t => t.id));
  
  return selectedTools.filter(toolId => availableIds.has(toolId));
}
