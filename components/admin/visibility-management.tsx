"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Loader2,
  Map as MapIcon,
  Target,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  toggleVisibility,
  getRoadmapVisibilityDetails,
} from "@/lib/actions/visibility-admin";
import type {
  VisibilityOverview,
  RoadmapVisibilityInfo,
  RoadmapVisibilityDetails,
  MilestoneVisibilityInfo,
  ObjectiveVisibilityInfo,
} from "@/lib/db/schemas/visibility";

interface VisibilityManagementProps {
  initialData: VisibilityOverview;
}

export function VisibilityManagement({ initialData }: VisibilityManagementProps) {
  const [data, setData] = useState(initialData);
  const [expandedRoadmaps, setExpandedRoadmaps] = useState<Set<string>>(() => new Set<string>());
  const [roadmapDetails, setRoadmapDetails] = useState<Map<string, RoadmapVisibilityDetails>>(() => new Map<string, RoadmapVisibilityDetails>());
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(() => new Set<string>());

  const toggleRoadmapExpanded = async (slug: string) => {
    const newExpanded = new Set<string>(expandedRoadmaps);
    
    if (newExpanded.has(slug)) {
      newExpanded.delete(slug);
    } else {
      newExpanded.add(slug);
      // Load details if not already loaded
      if (!roadmapDetails.has(slug)) {
        setLoadingDetails(prev => new Set<string>(prev).add(slug));
        const result = await getRoadmapVisibilityDetails(slug);
        if (result && !("success" in result && result.success === false) && !("error" in result)) {
          setRoadmapDetails(prev => new Map<string, RoadmapVisibilityDetails>(prev).set(slug, result));
        }
        setLoadingDetails(prev => {
          const next = new Set<string>(prev);
          next.delete(slug);
          return next;
        });
      }
    }
    
    setExpandedRoadmaps(newExpanded);
  };

  const handleRoadmapVisibilityChange = async (roadmap: RoadmapVisibilityInfo, isPublic: boolean) => {
    // Optimistic update
    setData(prev => ({
      ...prev,
      roadmaps: prev.roadmaps.map(r =>
        r.slug === roadmap.slug ? { ...r, isPublic } : r
      ),
      stats: {
        ...prev.stats,
        publicRoadmaps: prev.stats.publicRoadmaps + (isPublic ? 1 : -1),
      },
    }));

    const result = await toggleVisibility("roadmap", roadmap.slug, isPublic);
    
    if ("success" in result && !result.success) {
      // Revert on error
      setData(prev => ({
        ...prev,
        roadmaps: prev.roadmaps.map(r =>
          r.slug === roadmap.slug ? { ...r, isPublic: !isPublic } : r
        ),
        stats: {
          ...prev.stats,
          publicRoadmaps: prev.stats.publicRoadmaps + (isPublic ? -1 : 1),
        },
      }));
    }
  };

  return (
    <Card className="border-0 shadow-xl shadow-black/5 dark:shadow-black/20 bg-card/80 rounded-3xl overflow-hidden">
      <CardHeader className="border-b border-border/50 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-xl bg-primary/10">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold">Visibility Management</CardTitle>
        </div>
        <CardDescription>
          Control which roadmaps, milestones, and objectives are publicly visible
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 md:p-8">
        <div className="space-y-3">
          {data.roadmaps.length === 0 ? (
            <div className="text-center py-12">
              <MapIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No roadmaps found</p>
            </div>
          ) : (
            data.roadmaps.map((roadmap) => (
              <RoadmapVisibilityItem
                key={roadmap.slug}
                roadmap={roadmap}
                isExpanded={expandedRoadmaps.has(roadmap.slug)}
                details={roadmapDetails.get(roadmap.slug)}
                isLoadingDetails={loadingDetails.has(roadmap.slug)}
                onToggleExpand={() => toggleRoadmapExpanded(roadmap.slug)}
                onVisibilityChange={(isPublic) => handleRoadmapVisibilityChange(roadmap, isPublic)}
                onDetailsUpdate={(details) => {
                  setRoadmapDetails(prev => new Map<string, RoadmapVisibilityDetails>(prev).set(roadmap.slug, details));
                }}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}


interface RoadmapVisibilityItemProps {
  roadmap: RoadmapVisibilityInfo;
  isExpanded: boolean;
  details?: RoadmapVisibilityDetails;
  isLoadingDetails: boolean;
  onToggleExpand: () => void;
  onVisibilityChange: (isPublic: boolean) => void;
  onDetailsUpdate: (details: RoadmapVisibilityDetails) => void;
}

function RoadmapVisibilityItem({
  roadmap,
  isExpanded,
  details,
  isLoadingDetails,
  onToggleExpand,
  onVisibilityChange,
  onDetailsUpdate,
}: RoadmapVisibilityItemProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (checked: boolean) => {
    startTransition(() => {
      onVisibilityChange(checked);
    });
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
      <div className="rounded-2xl border border-border/50 bg-secondary/20 overflow-hidden">
        <div className="flex items-center gap-4 p-4">
          <CollapsibleTrigger className="flex items-center gap-3 flex-1 text-left hover:bg-secondary/30 -m-2 p-2 rounded-xl transition-colors">
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </motion.div>
            <div className="p-2 rounded-lg bg-primary/10">
              <MapIcon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{roadmap.title}</p>
              <p className="text-sm text-muted-foreground">
                {roadmap.publicMilestoneCount}/{roadmap.milestoneCount} milestones public
              </p>
            </div>
          </CollapsibleTrigger>
          
          <div className="flex items-center gap-3">
            <VisibilityBadge isPublic={roadmap.isPublic} />
            <Switch
              checked={roadmap.isPublic}
              onCheckedChange={handleToggle}
              disabled={isPending}
            />
          </div>
        </div>

        <CollapsibleContent>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-border/50"
              >
                {isLoadingDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : details ? (
                  <MilestonesList
                    milestones={details.milestones}
                    roadmapSlug={roadmap.slug}
                    roadmapIsPublic={roadmap.isPublic}
                    onUpdate={(milestones) => {
                      onDetailsUpdate({ ...details, milestones });
                    }}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Failed to load details
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

interface MilestonesListProps {
  milestones: MilestoneVisibilityInfo[];
  roadmapSlug: string;
  roadmapIsPublic: boolean;
  onUpdate: (milestones: MilestoneVisibilityInfo[]) => void;
}

function MilestonesList({ milestones, roadmapSlug, roadmapIsPublic, onUpdate }: MilestonesListProps) {
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(() => new Set<string>());

  const toggleMilestoneExpanded = (nodeId: string) => {
    setExpandedMilestones(prev => {
      const next = new Set<string>(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleMilestoneVisibilityChange = async (milestone: MilestoneVisibilityInfo, isPublic: boolean) => {
    // Optimistic update
    onUpdate(
      milestones.map(m =>
        m.nodeId === milestone.nodeId
          ? { ...m, isPublic, effectivelyPublic: roadmapIsPublic && isPublic }
          : m
      )
    );

    const result = await toggleVisibility(
      "milestone",
      milestone.nodeId,
      isPublic,
      roadmapSlug
    );

    if ("success" in result && !result.success) {
      // Revert on error
      onUpdate(
        milestones.map(m =>
          m.nodeId === milestone.nodeId
            ? { ...m, isPublic: !isPublic, effectivelyPublic: roadmapIsPublic && !isPublic }
            : m
        )
      );
    }
  };

  const handleObjectiveVisibilityChange = async (
    milestone: MilestoneVisibilityInfo,
    objective: ObjectiveVisibilityInfo,
    isPublic: boolean
  ) => {
    // Optimistic update
    onUpdate(
      milestones.map(m =>
        m.nodeId === milestone.nodeId
          ? {
              ...m,
              objectives: m.objectives.map(o =>
                o.index === objective.index
                  ? { ...o, isPublic, effectivelyPublic: roadmapIsPublic && m.isPublic && isPublic }
                  : o
              ),
            }
          : m
      )
    );

    const result = await toggleVisibility(
      "objective",
      `${milestone.nodeId}-${objective.index}`,
      isPublic,
      roadmapSlug,
      milestone.nodeId
    );

    if ("success" in result && !result.success) {
      // Revert on error
      onUpdate(
        milestones.map(m =>
          m.nodeId === milestone.nodeId
            ? {
                ...m,
                objectives: m.objectives.map(o =>
                  o.index === objective.index
                    ? { ...o, isPublic: !isPublic, effectivelyPublic: roadmapIsPublic && m.isPublic && !isPublic }
                    : o
                ),
              }
            : m
        )
      );
    }
  };

  if (milestones.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        No milestones in this roadmap
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      {milestones.map((milestone) => (
        <MilestoneVisibilityItem
          key={milestone.nodeId}
          milestone={milestone}
          roadmapIsPublic={roadmapIsPublic}
          isExpanded={expandedMilestones.has(milestone.nodeId)}
          onToggleExpand={() => toggleMilestoneExpanded(milestone.nodeId)}
          onVisibilityChange={(isPublic) => handleMilestoneVisibilityChange(milestone, isPublic)}
          onObjectiveVisibilityChange={(objective, isPublic) =>
            handleObjectiveVisibilityChange(milestone, objective, isPublic)
          }
        />
      ))}
    </div>
  );
}


interface MilestoneVisibilityItemProps {
  milestone: MilestoneVisibilityInfo;
  roadmapIsPublic: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onVisibilityChange: (isPublic: boolean) => void;
  onObjectiveVisibilityChange: (objective: ObjectiveVisibilityInfo, isPublic: boolean) => void;
}

function MilestoneVisibilityItem({
  milestone,
  roadmapIsPublic,
  isExpanded,
  onToggleExpand,
  onVisibilityChange,
  onObjectiveVisibilityChange,
}: MilestoneVisibilityItemProps) {
  const [isPending, startTransition] = useTransition();
  const effectivelyPublic = roadmapIsPublic && milestone.isPublic;

  const handleToggle = (checked: boolean) => {
    startTransition(() => {
      onVisibilityChange(checked);
    });
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
      <div className="rounded-xl border border-border/30 bg-background/50 overflow-hidden">
        <div className="flex items-center gap-3 p-3">
          <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-left hover:bg-secondary/30 -m-1.5 p-1.5 rounded-lg transition-colors">
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </motion.div>
            <div className="p-1.5 rounded-md bg-blue-500/10">
              <Target className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{milestone.title}</p>
              <p className="text-xs text-muted-foreground">
                {milestone.objectives.filter(o => o.effectivelyPublic).length}/{milestone.objectives.length} objectives public
              </p>
            </div>
          </CollapsibleTrigger>

          <div className="flex items-center gap-2">
            <EffectiveVisibilityIndicator
              isPublic={milestone.isPublic}
              effectivelyPublic={effectivelyPublic}
              parentIsPrivate={!roadmapIsPublic}
            />
            <Switch
              checked={milestone.isPublic}
              onCheckedChange={handleToggle}
              disabled={isPending}
              className="scale-90"
            />
          </div>
        </div>

        <CollapsibleContent>
          <AnimatePresence>
            {isExpanded && milestone.objectives.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-border/30 p-3 space-y-1.5"
              >
                {milestone.objectives.map((objective) => (
                  <ObjectiveVisibilityItem
                    key={objective.index}
                    objective={objective}
                    milestoneIsPublic={milestone.isPublic}
                    roadmapIsPublic={roadmapIsPublic}
                    onVisibilityChange={(isPublic) => onObjectiveVisibilityChange(objective, isPublic)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

interface ObjectiveVisibilityItemProps {
  objective: ObjectiveVisibilityInfo;
  milestoneIsPublic: boolean;
  roadmapIsPublic: boolean;
  onVisibilityChange: (isPublic: boolean) => void;
}

function ObjectiveVisibilityItem({
  objective,
  milestoneIsPublic,
  roadmapIsPublic,
  onVisibilityChange,
}: ObjectiveVisibilityItemProps) {
  const [isPending, startTransition] = useTransition();
  const effectivelyPublic = roadmapIsPublic && milestoneIsPublic && objective.isPublic;
  const parentIsPrivate = !roadmapIsPublic || !milestoneIsPublic;

  const handleToggle = (checked: boolean) => {
    startTransition(() => {
      onVisibilityChange(checked);
    });
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors">
      <div className="p-1 rounded bg-emerald-500/10">
        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
      </div>
      <p className="flex-1 text-xs text-foreground/80 truncate">{objective.title}</p>
      <EffectiveVisibilityIndicator
        isPublic={objective.isPublic}
        effectivelyPublic={effectivelyPublic}
        parentIsPrivate={parentIsPrivate}
        size="sm"
      />
      <Switch
        checked={objective.isPublic}
        onCheckedChange={handleToggle}
        disabled={isPending}
        className="scale-75"
      />
    </div>
  );
}

interface VisibilityBadgeProps {
  isPublic: boolean;
}

function VisibilityBadge({ isPublic }: VisibilityBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium",
        isPublic
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/20"
          : "bg-secondary text-muted-foreground"
      )}
    >
      {isPublic ? (
        <>
          <Eye className="w-3 h-3 mr-1" />
          Public
        </>
      ) : (
        <>
          <EyeOff className="w-3 h-3 mr-1" />
          Private
        </>
      )}
    </Badge>
  );
}

interface EffectiveVisibilityIndicatorProps {
  isPublic: boolean;
  effectivelyPublic: boolean;
  parentIsPrivate: boolean;
  size?: "sm" | "md";
}

function EffectiveVisibilityIndicator({
  isPublic,
  effectivelyPublic,
  parentIsPrivate,
  size = "md",
}: EffectiveVisibilityIndicatorProps) {
  // Show warning when item is set to public but parent is private
  if (isPublic && parentIsPrivate) {
    return (
      <div
        className={cn(
          "flex items-center gap-1 text-amber-600 dark:text-amber-400",
          size === "sm" ? "text-[10px]" : "text-xs"
        )}
        title="This item is set to public, but a parent is private"
      >
        <Lock className={cn(size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3")} />
        <span className="hidden sm:inline">Inherited private</span>
      </div>
    );
  }

  if (effectivelyPublic) {
    return (
      <div
        className={cn(
          "flex items-center gap-1 text-emerald-600 dark:text-emerald-400",
          size === "sm" ? "text-[10px]" : "text-xs"
        )}
      >
        <Globe className={cn(size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3")} />
        <span className="hidden sm:inline">Visible</span>
      </div>
    );
  }

  return null;
}
