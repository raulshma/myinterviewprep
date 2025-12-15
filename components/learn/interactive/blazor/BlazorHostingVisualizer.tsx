'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type HostingMode = 'server' | 'wasm';

interface BlazorHostingVisualizerProps {
  mode?: 'server-detailed' | 'webassembly-detailed';
}

const hostingModes: Record<HostingMode, {
  title: string;
  tag: string;
  summary: string;
  highlights: string[];
  layers: { label: string; detail: string; accent: string }[];
  metrics: Record<string, string>;
}> = {
  server: {
    title: 'Blazor Server',
    tag: 'SignalR Circuit',
    summary:
      'A persistent SignalR circuit manages every component render on the server, syncing UI diffs back to the browser in real time.',
    highlights: [
      'Minimal payload: only UI diffs and events traverse the wire.',
      'Circuit state lives on the server—perfect for secure/back-end-heavy apps.',
      'Needs steady connectivity; latency adds 1-2 extra network hops per interaction.',
    ],
    layers: [
      { label: 'Browser', detail: 'Thin client + Blazor boot script', accent: 'from-primary/10 to-primary/40' },
      { label: 'SignalR Circuit', detail: 'WebSocket/Server Sent Events pipe', accent: 'from-amber-500/10 to-amber-500/40' },
      { label: 'ASP.NET Core Server', detail: 'Handles render diff & C# execution', accent: 'from-emerald-500/10 to-emerald-500/40' },
    ],
    metrics: {
      'Initial payload': '< 500 KB',
      Latency: '50-120ms (depends on round-trips)',
      'State location': 'Server memory / Circuit store',
    },
  },
  wasm: {
    title: 'Blazor WebAssembly',
    tag: 'Browser-First Runtime',
    summary:
      'The .NET runtime downloads into the browser and executes entirely on the client, giving instant interactivity after the initial load.',
    highlights: [
      'Zero server round trips after downloads—latency disappears for UI updates.',
      'App + Runtime bundle (~4-6 MB gzip) shipped via CDN.',
      'Ideal for offline-capable SPAs and distributed teams.',
    ],
    layers: [
      { label: 'Browser', detail: 'Downloads dotnet.wasm + app DLLs', accent: 'from-sky-500/10 to-sky-500/40' },
      { label: 'WebAssembly Runtime', detail: 'Executes Razor + C# in the sandbox', accent: 'from-violet-500/10 to-violet-500/40' },
      { label: 'APIs / Backend', detail: 'REST gRPC calls for data', accent: 'from-teal-500/10 to-teal-500/40' },
    ],
    metrics: {
      'Initial payload': '4-6 MB (gzipped)',
      Latency: '3-5ms (local)',
      'State location': 'Browser memory',
    },
  },
};

export function BlazorHostingVisualizer({ mode }: BlazorHostingVisualizerProps) {
  const [activeMode, setActiveMode] = useState<HostingMode>(() => {
    if (mode === 'webassembly-detailed') return 'wasm';
    return 'server';
  });

  const current = hostingModes[activeMode];

  const buttonProps = useMemo(
    () => [
      { label: 'Server Hosting', value: 'server' as HostingMode },
      { label: 'WebAssembly Hosting', value: 'wasm' as HostingMode },
    ],
    []
  );

  return (
    <Card className="space-y-5">
      <CardHeader>
        <CardTitle>Blazor Hosting Visualizer</CardTitle>
        <CardDescription>
          Toggle between architecture models to understand when the Server circuit or the WebAssembly
          runtime shines.
        </CardDescription>
      </CardHeader>

      <div className="flex flex-wrap gap-2">
        {buttonProps.map((btn) => (
          <Button
            key={btn.label}
            variant={activeMode === btn.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveMode(btn.value)}
          >
            {btn.label}
          </Button>
        ))}
      </div>

      <CardContent className="space-y-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-foreground">{current.title}</h3>
            <Badge variant="outline" className="text-xs">
              {current.tag}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {current.summary}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            {current.highlights.map((item) => (
              <div key={item} className="rounded-2xl border border-border/70 bg-secondary/20 p-3 text-sm text-foreground">
                {item}
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <span>Architecture snapshot</span>
              <Badge variant="secondary" className="text-[11px]">
                {activeMode === 'server' ? 'SignalR Circuit' : 'Browser Runtime'}
              </Badge>
            </div>
            <div className="space-y-3">
              {current.layers.map((layer) => (
                <motion.div
                  key={layer.label}
                  initial={{ opacity: 0.9, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    'rounded-xl border border-border/60 bg-gradient-to-br p-3 text-sm text-foreground shadow-sm',
                    'from-white to-white'
                  )}
                  style={{
                    backgroundImage: `linear-gradient(120deg, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%)`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{layer.label}</span>
                    <Badge variant="outline" className="text-[11px]">
                      {layer.detail}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {layer.detail}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {Object.entries(current.metrics).map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-border/70 bg-secondary/20 p-3 text-sm"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-widest">{label}</p>
              <p className="text-base font-semibold text-foreground mt-1">{value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}