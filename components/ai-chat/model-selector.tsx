"use client";

import { useState, useEffect, useMemo, useRef, memo, useCallback } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ChevronDown,
  Search,
  Sparkles,
  DollarSign,
  Layers,
  Image as ImageIcon,
  Check,
  Loader2,
  BrainCircuit,
  Wrench,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OpenRouterModel, GroupedModels } from "@/app/api/models/route";
import { PROVIDER_INFO } from "@/lib/ai/types";
import type { AIProviderType } from "@/lib/ai/types";

const PROVIDER_STORAGE_KEY = "ai-chat-selected-provider";

const STORAGE_KEY = "ai-chat-selected-model";

interface VirtualizedModelListProps {
  models: OpenRouterModel[];
  selectedModelId: string | null;
  onSelectModel: (model: OpenRouterModel) => void;
}

const VirtualizedModelList = memo(function VirtualizedModelList({
  models,
  selectedModelId,
  onSelectModel,
}: VirtualizedModelListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(2);

  // Update column count based on viewport width
  useEffect(() => {
    const updateColumnCount = () => {
      setColumnCount(window.innerWidth < 768 ? 1 : 2);
    };

    updateColumnCount();
    window.addEventListener("resize", updateColumnCount);
    return () => window.removeEventListener("resize", updateColumnCount);
  }, []);

  // Calculate rows based on column count
  const rows = useMemo(() => {
    const result: OpenRouterModel[][] = [];
    for (let i = 0; i < models.length; i += columnCount) {
      result.push(models.slice(i, i + columnCount));
    }
    return result;
  }, [models, columnCount]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated row height
    overscan: 10, // Increased for smoother scrolling experience
  });

  const modelSupportsImages = (model: OpenRouterModel): boolean => {
    const modality = model.architecture?.modality?.toLowerCase() || "";
    return (
      modality.includes("image") ||
      modality.includes("multimodal") ||
      modality.includes("vision")
    );
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (num === 0) return "Free";
    return `$${(num * 1000000).toFixed(2)}/M`;
  };

  const ModelCard = ({ model }: { model: OpenRouterModel }) => {
    const isSelected = selectedModelId === model.id || selectedModelId === `google:${model.id}`;
    const supportsImages = modelSupportsImages(model);

    return (
      <button
        type="button"
        onClick={() => onSelectModel(model)}
        className={cn(
          "w-full p-3 rounded-xl text-left transition-all duration-200 border",
          isSelected
            ? "border-primary bg-primary/5"
            : "border-transparent hover:bg-muted/50"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm truncate">{model.name}</p>
              {isSelected && (
                <Check className="w-3.5 h-3.5 text-primary shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
              {model.id}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Badge
            variant="secondary"
            className="text-[10px] h-5 px-1.5 font-normal"
          >
            {model.provider === 'google' ? '🔷' : '🌐'} {model.provider === 'google' ? 'Google' : 'OpenRouter'}
          </Badge>
          <Badge
            variant="secondary"
            className="text-[10px] h-5 px-1.5 font-normal"
          >
            <Layers className="w-3 h-3 mr-1 opacity-70" />
            {(model.context_length / 1000).toFixed(0)}K
          </Badge>
          <Badge
            variant="secondary"
            className="text-[10px] h-5 px-1.5 font-normal"
          >
            <DollarSign className="w-3 h-3 mr-1 opacity-70" />
            {formatPrice(model.pricing.prompt)}
          </Badge>
          {supportsImages && (
            <Badge
              variant="secondary"
              className="text-[10px] h-5 px-1.5 font-normal bg-blue-500/10 text-blue-600"
            >
              <ImageIcon className="w-3 h-3 mr-1" />
              Vision
            </Badge>
          )}
          {model.supported_parameters?.some(
            (p) => p === "reasoning" || p === "include_reasoning"
          ) && (
              <Badge
                variant="secondary"
                className="text-[10px] h-5 px-1.5 font-normal bg-purple-500/10 text-purple-600"
              >
                <BrainCircuit className="w-3 h-3 mr-1" />
                Reasoning
              </Badge>
            )}
          {model.supported_parameters?.some(
            (p) => p === "tools" || p === "tool_choice"
          ) && (
              <Badge
                variant="secondary"
                className="text-[10px] h-5 px-1.5 font-normal bg-orange-500/10 text-orange-600"
              >
                <Wrench className="w-3 h-3 mr-1" />
                Tools
              </Badge>
            )}
          {model.supported_parameters?.includes("web_search_options") && (
            <Badge
              variant="secondary"
              className="text-[10px] h-5 px-1.5 font-normal bg-green-500/10 text-green-600"
            >
              <Globe className="w-3 h-3 mr-1" />
              Web
            </Badge>
          )}
        </div>
      </button>
    );
  };

  return (
    <div
      ref={parentRef}
      className="h-[350px] overflow-auto scroll-smooth"
      style={{
        contain: "strict",
        scrollBehavior: "smooth",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowModels = rows[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px) translateZ(0)`,
                willChange: "transform",
              }}
            >
              <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                {rowModels.map((model) => (
                  <ModelCard key={model.id} model={model} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

interface ModelSelectorProps {
  selectedModelId: string | null;
  onModelSelect: (modelId: string, supportsImages: boolean, provider: AIProviderType) => void;
  disabled?: boolean;
}

export const ModelSelector = memo(function ModelSelector({
  selectedModelId,
  onModelSelect,
  disabled,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [models, setModels] = useState<GroupedModels | null>(null);
  const [allModelsCache, setAllModelsCache] = useState<{ openrouter: GroupedModels; google: GroupedModels } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProvider, setActiveProvider] = useState<AIProviderType | "all">("all");

  useEffect(() => {
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      
      // Fetch from both providers in parallel
      const [openRouterRes, googleRes] = await Promise.all([
        fetch("/api/models?provider=openrouter"),
        fetch("/api/models?provider=google")
      ]);

      const openRouterData: GroupedModels = openRouterRes.ok 
        ? await openRouterRes.json() 
        : { free: [], paid: [] };
        
      const googleData: GroupedModels = googleRes.ok 
        ? await googleRes.json() 
        : { free: [], paid: [] };
      
      // Cache both provider results
      setAllModelsCache({ openrouter: openRouterData, google: googleData });
      
      // Restore saved provider preference
      const savedProvider = localStorage.getItem(PROVIDER_STORAGE_KEY) as AIProviderType | "all" | null;
      const providerToUse = savedProvider || "all";
      setActiveProvider(providerToUse);
      
      // Set models based on provider
      const modelsToShow = getModelsForProvider(providerToUse, openRouterData, googleData);
      setModels(modelsToShow);

      // Try to restore previously selected model (always sync with parent for modelSupportsImages)
      const savedModelId = localStorage.getItem(STORAGE_KEY);
      if (savedModelId) {
        // Search in all models for restoration
        const merged: GroupedModels = {
          free: [...openRouterData.free, ...googleData.free],
          paid: [...openRouterData.paid, ...googleData.paid]
        };
        const allModels = [...merged.paid, ...merged.free];
        // Check for exact match or prefixed match
        const savedModel = allModels.find((m) => {
          const mId = m.provider === 'google' ? `google:${m.id}` : m.id;
          return mId === savedModelId || m.id === savedModelId;
        });
        
        if (savedModel) {
          const idToUse = savedModel.provider === 'google' ? `google:${savedModel.id}` : savedModel.id;
          const provider: AIProviderType = savedModel.provider === 'google' ? 'google' : 'openrouter';
          // Always call onModelSelect to sync modelSupportsImages with parent
          onModelSelect(idToUse, modelSupportsImages(savedModel), provider);
        }
      }
    } catch (err) {
      console.error("Failed to load models:", err);
    } finally {
      setLoading(false);
    }
  };

  const getModelsForProvider = (
    provider: AIProviderType | "all",
    openRouterData: GroupedModels,
    googleData: GroupedModels
  ): GroupedModels => {
    if (provider === "openrouter") {
      return {
        free: openRouterData.free.sort((a, b) => a.name.localeCompare(b.name)),
        paid: openRouterData.paid.sort((a, b) => a.name.localeCompare(b.name))
      };
    }
    if (provider === "google") {
      return {
        free: googleData.free.sort((a, b) => a.name.localeCompare(b.name)),
        paid: googleData.paid.sort((a, b) => a.name.localeCompare(b.name))
      };
    }
    // "all" - merge both
    return {
      free: [...openRouterData.free, ...googleData.free].sort((a, b) => a.name.localeCompare(b.name)),
      paid: [...openRouterData.paid, ...googleData.paid].sort((a, b) => a.name.localeCompare(b.name))
    };
  };

  const handleProviderChange = (provider: AIProviderType | "all") => {
    setActiveProvider(provider);
    localStorage.setItem(PROVIDER_STORAGE_KEY, provider);
    
    if (allModelsCache) {
      const modelsToShow = getModelsForProvider(provider, allModelsCache.openrouter, allModelsCache.google);
      setModels(modelsToShow);
    }
  };

  const modelSupportsImages = (model: OpenRouterModel): boolean => {
    // Check architecture modality for image support
    const modality = model.architecture?.modality?.toLowerCase() || "";
    return (
      modality.includes("image") ||
      modality.includes("multimodal") ||
      modality.includes("vision")
    );
  };

  const allModels = useMemo(() => {
    if (!models) return [];
    return [...models.paid, ...models.free];
  }, [models]);

  const selectedModel = useMemo(() => {
    if (!selectedModelId || !models) return null;
    return allModels.find((m) => {
        const mId = m.provider === 'google' ? `google:${m.id}` : m.id;
        return mId === selectedModelId || m.id === selectedModelId;
    }) || null;
  }, [selectedModelId, allModels, models]);

  const filterModels = (modelList: OpenRouterModel[]) => {
    if (!searchQuery) return modelList;
    const query = searchQuery.toLowerCase();
    return modelList.filter(
      (m) =>
        m.id.toLowerCase().includes(query) ||
        m.name.toLowerCase().includes(query)
    );
  };

  const handleSelectModel = (model: OpenRouterModel) => {
    // Prefix ID with provider if it's Google, otherwise keep as is for OpenRouter (legacy compat)
    const idToUse = model.provider === 'google' ? `google:${model.id}` : model.id;
    const provider: AIProviderType = model.provider === 'google' ? 'google' : 'openrouter';
    
    localStorage.setItem(STORAGE_KEY, idToUse);
    onModelSelect(idToUse, modelSupportsImages(model), provider);
    setOpen(false);
    setSearchQuery("");
  };

  if (loading) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="h-8 gap-2 rounded-full"
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span className="text-xs">Loading models...</span>
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn(
            "h-8 gap-2 rounded-full max-w-[200px]",
            !selectedModel && "border-dashed border-amber-500/50 text-amber-600"
          )}
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs truncate">
            {selectedModel ? selectedModel.name : "Select model"}
          </span>
          <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[95vw] md:w-[600px] p-0 rounded-2xl"
        align="start"
      >
        <div className="p-3 border-b border-border/50 space-y-3">
          {/* Provider Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Provider:</span>
            <div className="flex gap-1.5">
              <Button
                variant={activeProvider === "all" ? "default" : "outline"}
                size="sm"
                className="h-7 rounded-full px-3 text-xs gap-1.5"
                onClick={() => handleProviderChange("all")}
              >
                All
              </Button>
              <Button
                variant={activeProvider === "openrouter" ? "default" : "outline"}
                size="sm"
                className="h-7 rounded-full px-3 text-xs gap-1.5"
                onClick={() => handleProviderChange("openrouter")}
              >
                <span>{PROVIDER_INFO.openrouter.icon}</span>
                <span>OpenRouter</span>
              </Button>
              <Button
                variant={activeProvider === "google" ? "default" : "outline"}
                size="sm"
                className="h-7 rounded-full px-3 text-xs gap-1.5"
                onClick={() => handleProviderChange("google")}
              >
                <span>{PROVIDER_INFO.google.icon}</span>
                <span>Google</span>
              </Button>
            </div>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 rounded-xl bg-muted/30 border-transparent"
            />
          </div>
        </div>
        <Tabs defaultValue="paid" className="w-full">
          <div className="px-3 pt-2">
            <TabsList className="w-full h-8 bg-muted/30 rounded-lg p-0.5">
              <TabsTrigger
                value="paid"
                className="flex-1 h-7 text-xs rounded-md"
              >
                Paid ({models?.paid.length || 0})
              </TabsTrigger>
              <TabsTrigger
                value="free"
                className="flex-1 h-7 text-xs rounded-md"
              >
                Free ({models?.free.length || 0})
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="paid" className="mt-0">
            <VirtualizedModelList
              models={filterModels(models?.paid || [])}
              selectedModelId={selectedModelId}
              onSelectModel={handleSelectModel}
            />
          </TabsContent>
          <TabsContent value="free" className="mt-0">
            <VirtualizedModelList
              models={filterModels(models?.free || [])}
              selectedModelId={selectedModelId}
              onSelectModel={handleSelectModel}
            />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
});
