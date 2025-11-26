'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart3,
  Loader2,
  Zap,
  Clock,
  DollarSign,
  AlertTriangle,
  Activity,
  Database,
  TrendingUp,
} from 'lucide-react';
import { getBYOKUsageStats } from '@/lib/actions/byok';
import type { BYOKUsageStats } from '@/lib/db/schemas/byok';

interface BYOKUsageStatsProps {
  hasByokKey: boolean;
}

export function BYOKUsageStatsSection({ hasByokKey }: BYOKUsageStatsProps) {
  const [stats, setStats] = useState<BYOKUsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasByokKey) {
      loadStats();
    } else {
      setLoading(false);
    }
  }, [hasByokKey]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const result = await getBYOKUsageStats(30);
      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error.message);
      }
    } catch {
      setError('Failed to load usage stats');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCost = (cost: number): string => {
    if (cost === 0) return '$0.00';
    if (cost < 0.01) return `$${cost.toFixed(4)}`;
    return `$${cost.toFixed(2)}`;
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!hasByokKey) {
    return null;
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-card border border-border p-6"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading usage stats...</span>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-card border border-border p-6"
      >
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      </motion.div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    { label: 'Total Requests', value: formatNumber(stats.totalRequests), icon: Activity, color: 'text-blue-500' },
    { label: 'Input Tokens', value: formatNumber(stats.totalInputTokens), icon: Database, color: 'text-green-500' },
    { label: 'Output Tokens', value: formatNumber(stats.totalOutputTokens), icon: Zap, color: 'text-amber-500' },
    { label: 'Total Cost', value: formatCost(stats.totalCost), icon: DollarSign, color: 'text-emerald-500' },
    { label: 'Avg Latency', value: `${stats.avgLatencyMs}ms`, icon: Clock, color: 'text-purple-500' },
    { label: 'Error Rate', value: `${stats.errorRate}%`, icon: AlertTriangle, color: stats.errorRate > 5 ? 'text-red-500' : 'text-yellow-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-card border border-border p-4 sm:p-6 hover:border-primary/30 transition-colors group overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
            <BarChart3 className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h2 className="font-mono text-lg text-foreground">API Usage Stats</h2>
            <p className="text-xs text-muted-foreground">Last 30 days with your key</p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          <TrendingUp className="w-3 h-3 mr-1" />
          {stats.totalRequests} calls
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {statCards.map(stat => (
          <div key={stat.label} className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              <span className="text-[10px] text-muted-foreground">{stat.label}</span>
            </div>
            <p className="font-mono text-sm text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="activity" className="space-y-3">
        <TabsList className="h-8 w-full grid grid-cols-3">
          <TabsTrigger value="activity" className="text-xs">Recent</TabsTrigger>
          <TabsTrigger value="actions" className="text-xs">By Action</TabsTrigger>
          <TabsTrigger value="models" className="text-xs">By Model</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <ScrollArea className="h-[200px]">
            <div className="space-y-2 pr-4">
              {stats.recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              ) : (
                stats.recentActivity.map((activity, i) => (
                  <div key={i} className="p-2 border border-border rounded-lg text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={activity.status === 'success' ? 'outline' : 'destructive'} className="text-[10px] h-5">
                        {activity.action.replace('_', ' ')}
                      </Badge>
                      <span className="text-muted-foreground">{formatDate(activity.timestamp)}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="font-mono truncate max-w-[120px]">{activity.model.split('/').pop()}</span>
                      <div className="flex items-center gap-2">
                        <span>{activity.inputTokens + activity.outputTokens} tokens</span>
                        <span>{formatCost(activity.cost)}</span>
                        <span>{activity.latencyMs}ms</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="actions">
          <ScrollArea className="h-[200px]">
            <div className="space-y-2 pr-4">
              {stats.byAction.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No data</p>
              ) : (
                stats.byAction.map(item => (
                  <div key={item.action} className="p-2 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{item.action.replace(/_/g, ' ')}</span>
                      <Badge variant="secondary" className="text-[10px]">{item.count} calls</Badge>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{formatNumber(item.inputTokens + item.outputTokens)} tokens</span>
                      <span>{formatCost(item.cost)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="models">
          <ScrollArea className="h-[200px]">
            <div className="space-y-2 pr-4">
              {stats.byModel.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No data</p>
              ) : (
                stats.byModel.map(item => (
                  <div key={item.model} className="p-2 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono truncate max-w-[180px]">{item.model}</span>
                      <Badge variant="secondary" className="text-[10px]">{item.count}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{formatNumber(item.inputTokens + item.outputTokens)} tokens</span>
                      <span>{formatCost(item.cost)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
