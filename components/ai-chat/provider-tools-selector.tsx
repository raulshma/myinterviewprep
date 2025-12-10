"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Link,
  Code,
  Sparkles,
  ImagePlus,
  ChevronDown,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getModelTools,
  getDefaultEnabledTools,
  validateToolSelection,
  type ProviderToolDefinition,
  type ProviderToolType,
} from "@/lib/ai/provider-tools";
import type { AIProviderType } from "@/lib/ai/types";

const STORAGE_KEY = "ai-chat-provider-tools";

// Icon mapping for tool definitions
const TOOL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Search,
  Link,
  Code,
  Sparkles,
  ImagePlus,
};

interface ProviderToolsSelectorProps {
  provider: AIProviderType;
  modelId: string;
  enabledTools: ProviderToolType[];
  onToolsChange: (tools: ProviderToolType[]) => void;
  disabled?: boolean;
}

/**
 * Provider-specific tools selector
 * Shows available tools for the selected provider/model and allows toggling
 */
export function ProviderToolsSelector({
  provider,
  modelId,
  enabledTools,
  onToolsChange,
  disabled = false,
}: ProviderToolsSelectorProps) {
  const [open, setOpen] = useState(false);

  // Get available tools for this provider/model
  const availableTools = useMemo(() => {
    return getModelTools(provider, modelId);
  }, [provider, modelId]);

  // Filter out fileInput from the toggle list (it's handled separately)
  const toggleableTools = useMemo(() => {
    return availableTools.filter(t => t.id !== 'fileInput');
  }, [availableTools]);

  // Count of enabled toggleable tools
  const enabledCount = useMemo(() => {
    return enabledTools.filter(t => t !== 'fileInput').length;
  }, [enabledTools]);

  // Don't render if no toggleable tools available
  if (toggleableTools.length === 0) {
    return null;
  }

  const handleToggle = (toolId: ProviderToolType, enabled: boolean) => {
    const newTools = enabled
      ? [...enabledTools, toolId]
      : enabledTools.filter(t => t !== toolId);
    
    onToolsChange(validateToolSelection(provider, modelId, newTools));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn(
            "h-8 gap-1.5 rounded-full text-xs",
            enabledCount > 0 && "border-primary/50 bg-primary/5"
          )}
        >
          <Settings2 className="h-3.5 w-3.5" />
          <span>Tools</span>
          {enabledCount > 0 && (
            <Badge 
              variant="secondary" 
              className="h-4 px-1 text-[10px] bg-primary/20 text-primary"
            >
              {enabledCount}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 rounded-2xl" 
        align="start"
        sideOffset={8}
      >
        <div className="p-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Settings2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Model Tools</h4>
              <p className="text-xs text-muted-foreground">
                Enable special capabilities for this model
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {toggleableTools.map((tool, index) => (
              <ToolToggleItem
                key={tool.id}
                tool={tool}
                enabled={enabledTools.includes(tool.id)}
                onToggle={(enabled) => handleToggle(tool.id, enabled)}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>

        <div className="p-3 border-t border-border/50 bg-muted/30">
          <p className="text-[10px] text-muted-foreground text-center">
            Tools may increase response time and token usage
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface ToolToggleItemProps {
  tool: ProviderToolDefinition;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  index: number;
}

function ToolToggleItem({ tool, enabled, onToggle, index }: ToolToggleItemProps) {
  const Icon = TOOL_ICONS[tool.icon] || Settings2;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "flex items-center gap-3 p-2.5 rounded-xl transition-colors",
        enabled ? "bg-primary/5" : "hover:bg-muted/50"
      )}
    >
      <div
        className={cn(
          "p-2 rounded-lg transition-colors",
          enabled ? "bg-primary/20" : "bg-muted"
        )}
      >
        <Icon className={cn(
          "h-4 w-4 transition-colors",
          enabled ? "text-primary" : "text-muted-foreground"
        )} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium transition-colors",
          enabled && "text-primary"
        )}>
          {tool.name}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {tool.description}
        </p>
      </div>
      
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        className="shrink-0"
      />
    </motion.div>
  );
}

/**
 * Load saved tools from localStorage
 */
function loadSavedTools(provider: AIProviderType, modelId: string): ProviderToolType[] {
  if (typeof window === 'undefined') {
    return getDefaultEnabledTools(provider, modelId);
  }
  
  const storageKey = `${STORAGE_KEY}:${provider}:${modelId}`;
  const saved = localStorage.getItem(storageKey);
  
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as ProviderToolType[];
      return validateToolSelection(provider, modelId, parsed);
    } catch {
      return getDefaultEnabledTools(provider, modelId);
    }
  }
  
  return getDefaultEnabledTools(provider, modelId);
}

/**
 * Hook to manage provider tools state with persistence
 * Note: This hook is exported for potential external use but the main component
 * manages its own state via props for better control flow.
 */
export function useProviderTools(
  provider: AIProviderType | null,
  modelId: string | null
) {
  // Compute the key for memoization
  const key = provider && modelId ? `${provider}:${modelId}` : null;
  
  // Use useMemo to compute initial tools based on key
  const initialTools = useMemo(() => {
    if (!provider || !modelId) return [];
    return loadSavedTools(provider, modelId);
  }, [provider, modelId]);

  // State that tracks the current enabled tools
  const [enabledTools, setEnabledToolsState] = useState<ProviderToolType[]>(initialTools);
  
  // Track the key to detect changes
  const prevKeyRef = useRef<string | null>(key);
  
  // When key changes, sync state with new initial tools
  // This is done via useMemo + conditional logic instead of useEffect
  if (prevKeyRef.current !== key) {
    prevKeyRef.current = key;
    // This is safe because we're in render phase and React will batch this
    if (enabledTools !== initialTools) {
      setEnabledToolsState(initialTools);
    }
  }

  // Save to storage when tools change
  const handleToolsChange = (tools: ProviderToolType[]) => {
    if (!provider || !modelId) return;
    
    setEnabledToolsState(tools);
    const storageKey = `${STORAGE_KEY}:${provider}:${modelId}`;
    localStorage.setItem(storageKey, JSON.stringify(tools));
  };

  return {
    enabledTools,
    setEnabledTools: handleToolsChange,
  };
}
