'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Server, ArrowUpCircle, Settings, Globe, RotateCcw, CheckCircle, Copy, ExternalLink, GitBranch, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface AzureAppServiceExplorerProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
  title?: string;
}

type DeploymentSlot = 'production' | 'staging' | 'dev';
type AppServiceTier = 'free' | 'basic' | 'standard' | 'premium';

interface SlotConfig {
  name: DeploymentSlot;
  status: 'running' | 'stopped' | 'swapping';
  url: string;
  version: string;
  traffic: number;
}

const tiers: Record<AppServiceTier, { name: string; features: string[]; price: string; instances: string }> = {
  free: {
    name: 'Free (F1)',
    features: ['1 GB RAM', 'Shared compute', '60 min/day'],
    price: 'Free',
    instances: '—',
  },
  basic: {
    name: 'Basic (B1)',
    features: ['1.75 GB RAM', 'Dedicated compute', 'Custom domain'],
    price: '~$13/mo',
    instances: 'Up to 3',
  },
  standard: {
    name: 'Standard (S1)',
    features: ['1.75 GB RAM', 'Auto scale', '5 slots', 'Daily backups'],
    price: '~$73/mo',
    instances: 'Up to 10',
  },
  premium: {
    name: 'Premium (P1v3)',
    features: ['4 GB RAM', '20 slots', 'VNet integration', 'Zone redundancy'],
    price: '~$142/mo',
    instances: 'Up to 30',
  },
};

export function AzureAppServiceExplorer({
  mode = 'beginner',
  title = 'Azure App Service Explorer',
}: AzureAppServiceExplorerProps) {
  const [selectedTier, setSelectedTier] = useState<AppServiceTier>('standard');
  const [slots, setSlots] = useState<SlotConfig[]>([
    { name: 'production', status: 'running', url: 'myapp.azurewebsites.net', version: 'v1.0.0', traffic: 100 },
    { name: 'staging', status: 'running', url: 'myapp-staging.azurewebsites.net', version: 'v1.1.0', traffic: 0 },
  ]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<DeploymentSlot>('staging');
  const [copiedUrl, setCopiedUrl] = useState(false);

  const simulateDeploy = useCallback(async () => {
    setIsDeploying(true);
    setDeployProgress(0);

    // Simulate deployment progress
    for (let i = 0; i <= 100; i += 10) {
      setDeployProgress(i);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Update staging slot version
    setSlots(prev =>
      prev.map(slot =>
        slot.name === 'staging'
          ? { ...slot, version: 'v1.2.0' }
          : slot
      )
    );
    setIsDeploying(false);
  }, []);

  const simulateSwap = useCallback(async () => {
    setIsSwapping(true);

    // Mark both slots as swapping
    setSlots(prev =>
      prev.map(slot => ({ ...slot, status: 'swapping' as const }))
    );

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Swap versions
    setSlots(prev => {
      const prodVersion = prev.find(s => s.name === 'production')?.version || 'v1.0.0';
      const stagingVersion = prev.find(s => s.name === 'staging')?.version || 'v1.1.0';
      return prev.map(slot => ({
        ...slot,
        status: 'running' as const,
        version: slot.name === 'production' ? stagingVersion : prodVersion,
      }));
    });

    setIsSwapping(false);
  }, []);

  const reset = useCallback(() => {
    setSlots([
      { name: 'production', status: 'running', url: 'myapp.azurewebsites.net', version: 'v1.0.0', traffic: 100 },
      { name: 'staging', status: 'running', url: 'myapp-staging.azurewebsites.net', version: 'v1.1.0', traffic: 0 },
    ]);
    setIsDeploying(false);
    setIsSwapping(false);
    setDeployProgress(0);
    setSelectedTier('standard');
  }, []);

  const copyUrl = useCallback(() => {
    const slot = slots.find(s => s.name === 'production');
    if (slot) {
      navigator.clipboard.writeText(`https://${slot.url}`);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  }, [slots]);

  const slotColors = {
    production: 'border-green-500 bg-green-900/20',
    staging: 'border-yellow-500 bg-yellow-900/20',
    dev: 'border-blue-500 bg-blue-900/20',
  };

  return (
    <Card className="my-4 overflow-hidden bg-gray-950 border-gray-800">
      <CardHeader className="pb-2 flex flex-row items-center justify-between bg-gray-900/50">
        <CardTitle className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <Cloud className="h-4 w-4 text-blue-400" />
          {title}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={reset} className="text-gray-400 hover:text-white">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Beginner Analogy */}
        {mode === 'beginner' && (
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <h4 className="font-medium text-blue-300 mb-2">🏠 Azure App Service = A Managed Apartment for Your App</h4>
            <p className="text-sm text-gray-400">
              Imagine renting a fully furnished apartment instead of building a house from scratch. 
              <strong className="text-blue-300"> Azure App Service</strong> is like that - Microsoft takes care of 
              the &quot;building&quot; (servers, security, maintenance), and you just bring your &quot;furniture&quot; (your app). 
              You can upgrade to a bigger apartment (scale up) or rent multiple apartments (scale out) anytime!
            </p>
          </div>
        )}

        {/* App Service Architecture */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-200">myapp.azurewebsites.net</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyUrl}
                className="text-gray-400 hover:text-white"
              >
                {copiedUrl ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* App Service Plan Selector (Intermediate+) */}
          {mode !== 'beginner' && (
            <div className="bg-gray-900/50 p-4 border-b border-gray-700">
              <div className="text-xs text-gray-400 mb-2">App Service Plan</div>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(tiers) as AppServiceTier[]).map(tier => (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={cn(
                      'p-2 rounded border text-xs transition-all',
                      selectedTier === tier
                        ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                        : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600',
                    )}
                  >
                    <div className="font-medium">{tiers[tier].name}</div>
                    <div className="text-gray-500 mt-1">{tiers[tier].price}</div>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {tiers[selectedTier].features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Deployment Slots */}
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-200">Deployment Slots</div>
              {mode === 'beginner' && (
                <span className="text-xs text-gray-500">Think of these as &quot;preview environments&quot;</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {slots.map(slot => (
                <motion.div
                  key={slot.name}
                  className={cn(
                    'border rounded-lg p-4 relative',
                    slotColors[slot.name],
                    slot.status === 'swapping' && 'animate-pulse',
                  )}
                  layout
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Server className={cn(
                        'h-4 w-4',
                        slot.name === 'production' ? 'text-green-400' : 'text-yellow-400',
                      )} />
                      <span className="text-sm font-medium capitalize text-gray-200">
                        {slot.name}
                      </span>
                    </div>
                    <motion.div
                      className={cn(
                        'h-2 w-2 rounded-full',
                        slot.status === 'running' && 'bg-green-400',
                        slot.status === 'stopped' && 'bg-red-400',
                        slot.status === 'swapping' && 'bg-yellow-400',
                      )}
                      animate={slot.status === 'running' ? { opacity: [1, 0.5, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span className="truncate">{slot.url}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      <span className="text-cyan-400">{slot.version}</span>
                    </div>
                    {slot.name === 'production' && (
                      <div className="flex items-center gap-1 text-green-400">
                        <Zap className="h-3 w-3" />
                        <span>{slot.traffic}% traffic</span>
                      </div>
                    )}
                  </div>
                  {slot.status === 'swapping' && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <span className="text-xs text-yellow-400">Swapping...</span>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Swap Animation Flow */}
            {mode !== 'beginner' && (
              <div className="flex items-center justify-center gap-4">
                <Button
                  size="sm"
                  onClick={simulateDeploy}
                  disabled={isDeploying || isSwapping}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowUpCircle className="h-3 w-3 mr-1" />
                  Deploy to Staging
                </Button>
                <Button
                  size="sm"
                  onClick={simulateSwap}
                  disabled={isDeploying || isSwapping}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Swap Slots
                </Button>
              </div>
            )}

            {/* Deploy Progress */}
            <AnimatePresence>
              {isDeploying && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-900 rounded p-3"
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gray-400">Deploying to staging...</span>
                    <span className="text-blue-400">{deployProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <motion.div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${deployProgress}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {deployProgress < 30 && 'Uploading files...'}
                    {deployProgress >= 30 && deployProgress < 60 && 'Installing dependencies...'}
                    {deployProgress >= 60 && deployProgress < 90 && 'Building application...'}
                    {deployProgress >= 90 && 'Completing deployment...'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Beginner: Simple Deploy Button */}
        {mode === 'beginner' && (
          <div className="flex justify-center">
            <Button
              onClick={simulateDeploy}
              disabled={isDeploying}
              className="bg-green-600 hover:bg-green-700"
            >
              {isDeploying ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="mr-2"
                  >
                    <ArrowUpCircle className="h-4 w-4" />
                  </motion.div>
                  Deploying...
                </>
              ) : (
                <>
                  <ArrowUpCircle className="h-4 w-4 mr-2" />
                  Deploy Your App
                </>
              )}
            </Button>
          </div>
        )}

        {/* Advanced: Configuration & Features */}
        {mode === 'advanced' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-200">App Settings</span>
              </div>
              <div className="space-y-1 font-mono text-xs">
                <div className="p-1.5 bg-gray-800 rounded flex justify-between">
                  <span className="text-gray-400">ASPNETCORE_ENVIRONMENT</span>
                  <span className="text-green-400">Production</span>
                </div>
                <div className="p-1.5 bg-gray-800 rounded flex justify-between">
                  <span className="text-gray-400">ConnectionStrings__Default</span>
                  <span className="text-yellow-400">***</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-200">Security Features</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span className="text-gray-300">SSL/TLS enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span className="text-gray-300">Managed identity</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span className="text-gray-300">IP restrictions</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success message */}
        <AnimatePresence>
          {deployProgress === 100 && !isDeploying && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-900/20 border border-green-700 rounded-lg p-3 flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-300">
                Deployment successful! Your app is now live on staging.
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default AzureAppServiceExplorer;
