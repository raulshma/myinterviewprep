'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Activity,
  Cpu,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import type { AIUsageDashboardData, AILogEntry } from '@/lib/actions/ai-usage';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AIUsageDashboardProps {
  data: AIUsageDashboardData;
}

const requestsChartConfig: ChartConfig = {
  requests: { label: 'Requests', color: '#8b5cf6' },
};

const STATUS_COLORS: Record<string, string> = {
  Success: '#10b981', // Emerald 500
  Error: '#ef4444',   // Red 500
  Timeout: '#f59e0b', // Amber 500
  'Rate Limited': '#f97316', // Orange 500
  Cancelled: '#94a3b8', // Slate 400
};

const ACTION_COLORS = [
  '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatCost(cost: number): string {
  if (cost < 0.01) return `$${cost.toFixed(6)}`;
  return `$${cost.toFixed(4)}`;
}

function StatCard({
  title,
  value,
  icon: Icon,
  colorClass,
  subtitle,
  className,
  delay = 0,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
  subtitle?: string;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn("h-full", className)}
    >
      <Card className="h-full border-0 shadow-sm bg-card/50 backdrop-blur-xl rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300 group">
        <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            <div className={cn("p-2 rounded-full bg-background/50 backdrop-blur-md opacity-80 group-hover:opacity-100 transition-opacity", colorClass)}>
              <Icon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1 font-medium">{subtitle}</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RecentLogsTable({ logs }: { logs: AILogEntry[] }) {
  const actionLabels: Record<string, string> = {
    GENERATE_BRIEF: 'Brief',
    GENERATE_TOPICS: 'Topics',
    GENERATE_MCQ: 'MCQ',
    GENERATE_RAPID_FIRE: 'Rapid Fire',
    REGENERATE_ANALOGY: 'Analogy',
    PARSE_PROMPT: 'Parse',
    TOPIC_CHAT: 'Chat',
    GENERATE_ACTIVITY_MCQ: 'Activity MCQ',
    GENERATE_ACTIVITY_CODING_CHALLENGE: 'Coding',
    GENERATE_ACTIVITY_DEBUGGING_TASK: 'Debug',
    GENERATE_ACTIVITY_CONCEPT_EXPLANATION: 'Concept',
    GENERATE_ACTIVITY_REAL_WORLD_ASSIGNMENT: 'Assignment',
    GENERATE_ACTIVITY_MINI_CASE_STUDY: 'Case Study',
    ANALYZE_FEEDBACK: 'Feedback',
    AGGREGATE_ANALYSIS: 'Analysis',
    GENERATE_IMPROVEMENT_PLAN: 'Plan',
    STREAM_IMPROVEMENT_ACTIVITY: 'Improvement',
  };

  return (
    <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-xl rounded-3xl overflow-hidden">
      <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-semibold tracking-tight">Recent Activity</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">Latest AI interactions</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="rounded-full text-xs font-medium h-8 px-3 hover:bg-secondary/50">
          View All <ArrowUpRight className="w-3 h-3 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/20">
                <tr>
                  <th className="text-left py-3 px-8 text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Model</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tokens</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Cost</th>
                  <th className="text-right py-3 px-8 text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-secondary/10 transition-colors group">
                    <td className="py-4 px-8">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                        <span className="font-medium text-sm text-foreground">
                          {actionLabels[log.action] || log.action}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground font-mono">
                      {log.model.split('/').pop()}
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "font-medium text-xs rounded-full px-2.5 py-0.5 border-0",
                          log.status === 'success'
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                        )}
                      >
                        {log.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-right font-mono text-muted-foreground">
                      {formatNumber(log.tokenUsage.input + log.tokenUsage.output)}
                    </td>
                    <td className="py-4 px-4 text-sm text-right font-mono text-muted-foreground">
                      {log.estimatedCost ? formatCost(log.estimatedCost) : '-'}
                    </td>
                    <td className="py-4 px-8 text-sm text-right text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-full bg-secondary/30 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No requests yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AIUsageDashboard({ data }: AIUsageDashboardProps) {
  const { stats, trends, actionBreakdown, modelUsage, statusBreakdown, recentLogs } = data;

  const formattedTrends = trends.map((d) => ({
    ...d,
    formattedDate: formatDate(d.date),
  }));

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Main Stats - Top Row */}
        <StatCard
          title="Total Requests"
          value={formatNumber(stats.totalRequests)}
          icon={Activity}
          colorClass="text-violet-500 bg-violet-500/10"
          delay={0}
        />
        <StatCard
          title="Total Tokens"
          value={formatNumber(stats.totalInputTokens + stats.totalOutputTokens)}
          icon={Cpu}
          colorClass="text-blue-500 bg-blue-500/10"
          subtitle={`${formatNumber(stats.totalInputTokens)} in · ${formatNumber(stats.totalOutputTokens)} out`}
          delay={0.05}
        />
        <StatCard
          title="Estimated Cost"
          value={formatCost(stats.totalCost)}
          icon={DollarSign}
          colorClass="text-emerald-500 bg-emerald-500/10"
          delay={0.1}
        />
        <StatCard
          title="Avg Latency"
          value={`${stats.avgLatencyMs}ms`}
          icon={Clock}
          colorClass="text-amber-500 bg-amber-500/10"
          delay={0.15}
        />

        {/* Usage Trends Chart - Large Block */}
        <motion.div
          className="col-span-1 md:col-span-2 lg:col-span-3 row-span-2"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full border-0 shadow-sm bg-card/50 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardHeader className="p-8 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-violet-500/10 text-violet-500">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <CardTitle className="text-lg font-semibold tracking-tight">Usage Trends</CardTitle>
              </div>
              <CardDescription>Request volume over time</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 h-[350px]">
              <ChartContainer config={requestsChartConfig} className="h-full w-full">
                <AreaChart data={formattedTrends} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-requests)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-requests)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/20" vertical={false} />
                  <XAxis
                    dataKey="formattedDate"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    allowDecimals={false}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent indicator="line" />}
                    cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.5 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    stroke="var(--color-requests)"
                    fill="url(#colorRequests)"
                    strokeWidth={2}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status Breakdown - Side Block */}
        <motion.div
          className="col-span-1 lg:col-span-1 row-span-2"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Card className="h-full border-0 shadow-sm bg-card/50 backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col">
            <CardHeader className="p-6 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <CardTitle className="text-lg font-semibold tracking-tight">Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col justify-center">
              <div className="h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusBreakdown}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      cornerRadius={4}
                      stroke="none"
                    >
                      {statusBreakdown.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                  <span className="text-2xl font-bold tracking-tight">{stats.successRate}%</span>
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Success</span>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {statusBreakdown.slice(0, 3).map((item) => (
                  <div key={item.status} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[item.status] || '#94a3b8' }}
                      />
                      <span className="text-muted-foreground">{item.status}</span>
                    </div>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Model Usage - Wide Block */}
        <motion.div
          className="col-span-1 md:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="h-full border-0 shadow-sm bg-card/50 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardHeader className="p-6 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                  <Cpu className="w-4 h-4" />
                </div>
                <CardTitle className="text-lg font-semibold tracking-tight">Model Usage</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {modelUsage.slice(0, 4).map((model, i) => (
                  <div key={model.model} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-xs font-mono text-muted-foreground">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{model.model.split('/').pop()}</p>
                        <p className="text-xs text-muted-foreground">{model.count} requests</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{formatCost(model.totalCost)}</p>
                      <p className="text-xs text-muted-foreground">{formatNumber(model.totalTokens)} tokens</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Breakdown - Wide Block */}
        <motion.div
          className="col-span-1 md:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Card className="h-full border-0 shadow-sm bg-card/50 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardHeader className="p-6 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-amber-500/10 text-amber-500">
                  <Zap className="w-4 h-4" />
                </div>
                <CardTitle className="text-lg font-semibold tracking-tight">Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {actionBreakdown.slice(0, 6).map((item, i) => (
                  <div key={item.action} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-muted-foreground truncate max-w-[120px]">{item.action.replace(/_/g, ' ')}</span>
                      <span className="text-foreground">{item.percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-secondary/30 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: ACTION_COLORS[i % ACTION_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Logs Table - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <RecentLogsTable logs={recentLogs} />
      </motion.div>
    </div>
  );
}
