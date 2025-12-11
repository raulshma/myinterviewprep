import { Infinity, Zap, MessageSquare } from "lucide-react";

interface UsageData {
  count: number;
  limit: number;
}

interface SidebarUsageProps {
  iterations: UsageData;
  interviews: UsageData;
  plan: string;
  isByok: boolean;
}

function UsageBar({
  label,
  icon: Icon,
  count,
  limit,
  isByok,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  limit: number;
  isByok: boolean;
}) {
  const percentage = limit > 0 ? Math.min((count / limit) * 100, 100) : 0;
  const isAtLimit = count >= limit && !isByok;
  const isNearLimit = percentage >= 80 && !isByok;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        {isByok ? (
          <span className="text-xs font-mono text-foreground flex items-center gap-1">
            <Infinity className="w-3 h-3" />
          </span>
        ) : (
          <span
            className={`text-xs font-mono tabular-nums ${
              isAtLimit
                ? "text-destructive"
                : isNearLimit
                ? "text-amber-500"
                : "text-foreground"
            }`}
          >
            {Number.isInteger(count) ? count : count.toFixed(2)}
            <span className="text-muted-foreground">/{limit}</span>
          </span>
        )}
      </div>
      {!isByok && (
        <div className="h-1 bg-muted overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out ${
              isAtLimit
                ? "bg-destructive"
                : isNearLimit
                ? "bg-amber-500"
                : "bg-foreground/70"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function SidebarUsage({
  iterations,
  interviews,
  plan,
  isByok,
}: SidebarUsageProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-3 bg-primary/50" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
          Usage
        </span>
      </div>

      <UsageBar
        label="Iterations"
        icon={Zap}
        count={iterations.count}
        limit={iterations.limit}
        isByok={isByok}
      />

      <UsageBar
        label="Interviews"
        icon={MessageSquare}
        count={interviews.count}
        limit={interviews.limit}
        isByok={isByok}
      />
    </div>
  );
}
