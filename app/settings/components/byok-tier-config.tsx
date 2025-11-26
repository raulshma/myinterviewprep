'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Layers,
  Search,
  Check,
  DollarSign,
  Zap,
  Gauge,
  Feather,
  AlertTriangle,
  Trash2,
  Loader2,
  Settings,
  Wand2,
} from 'lucide-react';
import { getBYOKTierConfig, saveBYOKTierConfig, clearBYOKTierConfig, getSystemTierConfig } from '@/lib/actions/byok';
import type { BYOKUserConfig, BYOKTierConfig } from '@/lib/db/schemas/byok';
import type { OpenRouterModel, GroupedModels } from '@/app/api/models/route';

type ModelTier = 'high' | 'medium' | 'low';

const TIER_INFO: Record<ModelTier, { label: string; icon: typeof Zap; description: string; color: string }> = {
  high: {
    label: 'High',
    icon: Zap,
    description: 'Topics, briefs, MCQs, analogies',
    color: 'text-amber-500',
  },
  medium: {
    label: 'Medium',
    icon: Gauge,
    description: 'Rapid-fire questions',
    color: 'text-blue-500',
  },
  low: {
    label: 'Low',
    icon: Feather,
    description: 'Prompt parsing',
    color: 'text-green-500',
  },
};

const DEFAULT_TIER: BYOKTierConfig = {
  model: '',
  fallback: undefined,
  temperature: 0.7,
  maxTokens: 4096,
};

interface BYOKTierConfigProps {
  hasByokKey: boolean;
}

export function BYOKTierConfigSection({ hasByokKey }: BYOKTierConfigProps) {
  const router = useRouter();
  const [config, setConfig] = useState<BYOKUserConfig>({});
  const [models, setModels] = useState<GroupedModels | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTier, setActiveTier] = useState<ModelTier>('high');
  const [selectingFor, setSelectingFor] = useState<'primary' | 'fallback'>('primary');
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (hasByokKey) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [hasByokKey]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configResult, modelsResponse] = await Promise.all([
        getBYOKTierConfig(),
        fetch('/api/models'),
      ]);

      if (configResult.success && configResult.data) {
        setConfig(configResult.data);
      }

      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        setModels(modelsData);
      }
    } catch (err) {
      setError('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const filterModels = (modelList: OpenRouterModel[]) => {
    if (!searchQuery) return modelList;
    const query = searchQuery.toLowerCase();
    return modelList.filter(
      m => m.id.toLowerCase().includes(query) || m.name.toLowerCase().includes(query)
    );
  };

  const findModel = (modelId: string): OpenRouterModel | undefined => {
    if (!models) return undefined;
    return models.paid.find(m => m.id === modelId) || models.free.find(m => m.id === modelId);
  };

  const getTierConfig = (tier: ModelTier): BYOKTierConfig => {
    return config[tier] || { ...DEFAULT_TIER };
  };

  const handleSelectModel = (modelId: string, tier: ModelTier, type: 'primary' | 'fallback') => {
    const model = findModel(modelId);
    const maxTokens = model?.top_provider?.max_completion_tokens;

    setConfig(prev => {
      const tierConfig = prev[tier] || { ...DEFAULT_TIER };
      return {
        ...prev,
        [tier]: {
          ...tierConfig,
          ...(type === 'primary' ? { model: modelId } : { fallback: modelId }),
          ...(type === 'primary' && maxTokens ? { maxTokens } : {}),
        },
      };
    });
    setSaved(false);
  };

  const handleUpdateSettings = (tier: ModelTier, field: 'temperature' | 'maxTokens', value: number) => {
    setConfig(prev => {
      const tierConfig = prev[tier] || { ...DEFAULT_TIER };
      return {
        ...prev,
        [tier]: { ...tierConfig, [field]: value },
      };
    });
    setSaved(false);
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await saveBYOKTierConfig(config);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      } else {
        setError(result.error.message);
      }
    });
  };

  const handleClear = () => {
    if (!confirm('Clear all tier configurations? You will use system defaults.')) return;
    startTransition(async () => {
      const result = await clearBYOKTierConfig();
      if (result.success) {
        setConfig({});
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      }
    });
  };

  const handleAutoFill = () => {
    startTransition(async () => {
      const result = await getSystemTierConfig();
      if (result.success && result.data) {
        setConfig(result.data);
        setSaved(false);
        setError(null);
      } else if (result.success && !result.data) {
        setError('No system configuration available. Admin has not configured models yet.');
      } else if (!result.success) {
        setError(result.error.message || 'Failed to load system config');
      }
    });
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (num === 0) return 'Free';
    return `$${(num * 1000000).toFixed(2)}/M`;
  };

  const isConfigured = (tier: ModelTier) => !!config[tier]?.model;
  const configuredCount = (['high', 'medium', 'low'] as ModelTier[]).filter(isConfigured).length;

  if (!hasByokKey) {
    return null;
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card border border-border p-6"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading configuration...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-card border border-border p-6 hover:border-primary/30 transition-colors group"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Settings className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h2 className="font-mono text-lg text-foreground">Model Configuration</h2>
            <p className="text-xs text-muted-foreground">Configure models for your API key</p>
          </div>
        </div>
        <Badge variant={configuredCount === 3 ? 'default' : 'secondary'}>
          {configuredCount}/3 Configured
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {/* Tier Selection */}
        <div className="grid grid-cols-3 gap-2">
          {(['high', 'medium', 'low'] as ModelTier[]).map(tier => {
            const info = TIER_INFO[tier];
            const Icon = info.icon;
            const tierConfig = getTierConfig(tier);
            return (
              <div
                key={tier}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  activeTier === tier
                    ? 'border-foreground bg-muted/50'
                    : 'border-border hover:border-foreground/50'
                }`}
                onClick={() => setActiveTier(tier)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${info.color}`} />
                    <span className="text-xs font-medium">{info.label}</span>
                  </div>
                  {isConfigured(tier) && <Check className="w-3 h-3 text-green-500" />}
                </div>
                <p className="font-mono text-[10px] text-muted-foreground truncate">
                  {tierConfig.model || 'Not set'}
                </p>
              </div>
            );
          })}
        </div>

        {/* Active Tier Config */}
        <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/20">
          <div className="flex items-center gap-2 text-sm">
            {(() => {
              const Icon = TIER_INFO[activeTier].icon;
              return <Icon className={`w-4 h-4 ${TIER_INFO[activeTier].color}`} />;
            })()}
            <span className="font-medium">{TIER_INFO[activeTier].label} Tier</span>
            <span className="text-muted-foreground">— {TIER_INFO[activeTier].description}</span>
          </div>

          {/* Model Type Tabs */}
          <Tabs value={selectingFor} onValueChange={v => setSelectingFor(v as 'primary' | 'fallback')}>
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger value="primary" className="text-xs">Primary</TabsTrigger>
              <TabsTrigger value="fallback" className="text-xs">Fallback</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search models..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 h-9 text-sm"
            />
          </div>

          {/* Model List */}
          <Tabs defaultValue="paid">
            <TabsList className="h-8">
              <TabsTrigger value="paid" className="text-xs gap-1">
                <DollarSign className="w-3 h-3" />
                Paid
              </TabsTrigger>
              <TabsTrigger value="free" className="text-xs">Free</TabsTrigger>
            </TabsList>

            <TabsContent value="paid" className="mt-2">
              <ScrollArea className="h-[180px]">
                <div className="space-y-1.5 pr-4">
                  {filterModels(models?.paid || []).map(model => {
                    const tierConfig = getTierConfig(activeTier);
                    const isSelected = selectingFor === 'primary'
                      ? tierConfig.model === model.id
                      : tierConfig.fallback === model.id;
                    return (
                      <div
                        key={model.id}
                        onClick={() => handleSelectModel(model.id, activeTier, selectingFor)}
                        className={`p-2 border rounded cursor-pointer transition-all hover:border-foreground/50 ${
                          isSelected ? 'border-foreground bg-muted/50' : 'border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-xs text-foreground truncate">{model.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{model.id}</p>
                          </div>
                          <div className="flex items-center gap-1.5 ml-2">
                            <Badge variant="outline" className="text-[10px] h-5">
                              <Layers className="w-2.5 h-2.5 mr-0.5" />
                              {(model.context_length / 1000).toFixed(0)}K
                            </Badge>
                            <Badge variant="outline" className="text-[10px] h-5">
                              {formatPrice(model.pricing.prompt)}
                            </Badge>
                            {isSelected && <Check className="w-3.5 h-3.5 text-green-500" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="free" className="mt-2">
              <ScrollArea className="h-[180px]">
                <div className="space-y-1.5 pr-4">
                  {filterModels(models?.free || []).map(model => {
                    const tierConfig = getTierConfig(activeTier);
                    const isSelected = selectingFor === 'primary'
                      ? tierConfig.model === model.id
                      : tierConfig.fallback === model.id;
                    return (
                      <div
                        key={model.id}
                        onClick={() => handleSelectModel(model.id, activeTier, selectingFor)}
                        className={`p-2 border rounded cursor-pointer transition-all hover:border-foreground/50 ${
                          isSelected ? 'border-foreground bg-muted/50' : 'border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-xs text-foreground truncate">{model.name}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-[10px] h-5 text-green-500">Free</Badge>
                            {isSelected && <Check className="w-3.5 h-3.5 text-green-500" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Temperature & Max Tokens */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Temperature</Label>
              <Input
                type="number"
                value={getTierConfig(activeTier).temperature}
                onChange={e => handleUpdateSettings(activeTier, 'temperature', parseFloat(e.target.value) || 0)}
                step="0.1"
                min="0"
                max="2"
                className="font-mono h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Max Tokens</Label>
              <Input
                type="number"
                value={getTierConfig(activeTier).maxTokens}
                onChange={e => handleUpdateSettings(activeTier, 'maxTokens', parseInt(e.target.value) || 0)}
                className="font-mono h-8 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isPending} className="flex-1">
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4 mr-2" />
            ) : null}
            {saved ? 'Saved!' : 'Save Configuration'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleAutoFill} 
            disabled={isPending}
            title="Copy system configuration"
          >
            <Wand2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={handleClear} disabled={isPending}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          Use <Wand2 className="w-3 h-3 inline" /> to copy admin's model selection. Your key is always used for API calls.
        </p>
      </div>
    </motion.div>
  );
}
