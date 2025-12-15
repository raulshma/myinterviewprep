"use client";

/**
 * Mermaid Diagram Component
 * 
 * A robust, performant React component for rendering Mermaid diagrams.
 * Features:
 * - Lazy loading with dynamic import
 * - Theme-aware using CSS variables from globals.css
 * - Error boundary with fallback
 * - Loading states
 * - Zoom/pan support
 * - Copy diagram source
 * - Unique ID generation to prevent conflicts
 */

import {
  memo,
  useEffect,
  useRef,
  useState,
  useCallback,
  useId,
} from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { 
  AlertCircle, 
  Copy, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Types
interface MermaidDiagramProps {
  /** The Mermaid diagram definition string */
  chart: string;
  /** Optional className for the container */
  className?: string;
  /** Optional title for the diagram */
  title?: string;
  /** Whether to show the toolbar (copy, zoom controls) */
  showToolbar?: boolean;
  /** Custom error fallback */
  errorFallback?: React.ReactNode;
}

interface MermaidError {
  message: string;
  hash?: string;
}

// Mermaid instance (lazy loaded)
let mermaidInstance: typeof import("mermaid").default | null = null;
let mermaidInitialized = false;
let lastThemeColors: string = "";

/**
 * Get CSS variable value from the document
 */
function getCssVar(name: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Get theme colors from CSS variables
 */
function getThemeColors() {
  const colors = {
    background: getCssVar("--background") || "#ffffff",
    foreground: getCssVar("--foreground") || "#000000",
    card: getCssVar("--card") || "#ffffff",
    cardForeground: getCssVar("--card-foreground") || "#000000",
    primary: getCssVar("--primary") || "#000000",
    primaryForeground: getCssVar("--primary-foreground") || "#ffffff",
    secondary: getCssVar("--secondary") || "#f4f4f5",
    secondaryForeground: getCssVar("--secondary-foreground") || "#000000",
    muted: getCssVar("--muted") || "#f4f4f5",
    mutedForeground: getCssVar("--muted-foreground") || "#525252",
    accent: getCssVar("--accent") || "#f4f4f5",
    accentForeground: getCssVar("--accent-foreground") || "#000000",
    border: getCssVar("--border") || "#e4e4e7",
    destructive: getCssVar("--destructive") || "#ef4444",
    chart1: getCssVar("--chart-1") || "#000000",
    chart2: getCssVar("--chart-2") || "#27272a",
    chart3: getCssVar("--chart-3") || "#52525b",
    chart4: getCssVar("--chart-4") || "#71717a",
    chart5: getCssVar("--chart-5") || "#a1a1aa",
  };
  return colors;
}

/**
 * Initialize mermaid with theme-aware configuration using CSS variables
 */
async function initializeMermaid(theme: "light" | "dark") {
  if (!mermaidInstance) {
    const mermaid = (await import("mermaid")).default;
    mermaidInstance = mermaid;
  }

  // Get current theme colors from CSS variables
  const colors = getThemeColors();
  const colorsKey = JSON.stringify(colors);
  
  // Skip re-initialization if colors haven't changed
  if (mermaidInitialized && lastThemeColors === colorsKey) {
    return mermaidInstance;
  }
  lastThemeColors = colorsKey;

  // Determine if dark mode based on background luminance
  const isDark = theme === "dark";

  // Use 'base' theme for full customization control
  mermaidInstance.initialize({
    startOnLoad: false,
    theme: "base",
    securityLevel: "strict",
    logLevel: "error" as const,
    fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif',
    
    // Flowchart specific config
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: "basis",
      padding: 20,
      nodeSpacing: 60,
      rankSpacing: 60,
      diagramPadding: 16,
      wrappingWidth: 200,
    },
    
    // Sequence diagram config
    sequence: {
      diagramMarginX: 50,
      diagramMarginY: 16,
      actorMargin: 60,
      width: 180,
      height: 70,
      boxMargin: 12,
      boxTextMargin: 8,
      noteMargin: 12,
      messageMargin: 40,
      useMaxWidth: true,
      mirrorActors: true,
      rightAngles: false,
      showSequenceNumbers: false,
      actorFontSize: 14,
      noteFontSize: 13,
      messageFontSize: 14,
    },
    
    // Gantt chart config
    gantt: {
      titleTopMargin: 25,
      barHeight: 24,
      barGap: 6,
      topPadding: 60,
      leftPadding: 80,
      gridLineStartPadding: 40,
      fontSize: 13,
      useMaxWidth: true,
    },

    // Class diagram config
    class: {
      useMaxWidth: true,
    },

    // State diagram config
    state: {
      useMaxWidth: true,
    },

    // ER diagram config
    er: {
      useMaxWidth: true,
      fontSize: 13,
    },

    // Pie chart config
    pie: {
      useMaxWidth: true,
      textPosition: 0.75,
    },

    // Theme variables using CSS variables from globals.css
    themeVariables: {
      // Primary colors from theme
      primaryColor: colors.primary,
      primaryTextColor: colors.primaryForeground,
      primaryBorderColor: colors.primary,
      
      // Secondary colors from theme
      secondaryColor: colors.secondary,
      secondaryTextColor: colors.secondaryForeground,
      secondaryBorderColor: colors.border,
      
      // Tertiary colors from theme
      tertiaryColor: colors.muted,
      tertiaryTextColor: colors.mutedForeground,
      tertiaryBorderColor: colors.border,
      
      // Background and text from theme
      background: colors.background,
      mainBkg: colors.card,
      textColor: colors.foreground,
      titleColor: colors.foreground,
      
      // Lines and borders from theme
      lineColor: colors.mutedForeground,
      border1: colors.border,
      border2: colors.border,
      
      // Notes and labels
      noteBkgColor: colors.accent,
      noteTextColor: colors.accentForeground,
      noteBorderColor: colors.primary,
      
      // Flowchart specific
      nodeBkg: colors.card,
      nodeBorder: colors.primary,
      clusterBkg: colors.secondary,
      clusterBorder: colors.border,
      defaultLinkColor: colors.mutedForeground,
      edgeLabelBackground: colors.background,
      
      // Sequence diagram
      actorBkg: colors.card,
      actorBorder: colors.primary,
      actorTextColor: colors.foreground,
      actorLineColor: colors.border,
      signalColor: colors.mutedForeground,
      signalTextColor: colors.foreground,
      labelBoxBkgColor: colors.card,
      labelBoxBorderColor: colors.border,
      labelTextColor: colors.foreground,
      loopTextColor: colors.mutedForeground,
      activationBkgColor: colors.accent,
      activationBorderColor: colors.primary,
      sequenceNumberColor: colors.primary,
      
      // State diagram
      labelColor: colors.foreground,
      altBackground: colors.secondary,
      
      // Class diagram
      classText: colors.foreground,
      
      // Git graph - use chart colors
      git0: colors.chart1,
      git1: colors.chart2,
      git2: colors.chart3,
      git3: colors.chart4,
      git4: colors.chart5,
      git5: colors.chart1,
      git6: colors.chart2,
      git7: colors.chart3,
      gitBranchLabel0: colors.primaryForeground,
      gitBranchLabel1: colors.primaryForeground,
      gitBranchLabel2: colors.foreground,
      gitBranchLabel3: colors.primaryForeground,
      commitLabelColor: colors.foreground,
      commitLabelBackground: colors.secondary,
      
      // Gantt
      sectionBkgColor: colors.card,
      altSectionBkgColor: colors.secondary,
      sectionBkgColor2: colors.muted,
      taskBkgColor: colors.primary,
      taskTextColor: colors.primaryForeground,
      taskTextLightColor: colors.primaryForeground,
      taskTextOutsideColor: colors.foreground,
      taskTextClickableColor: colors.primary,
      activeTaskBkgColor: colors.accent,
      activeTaskBorderColor: colors.primary,
      doneTaskBkgColor: colors.muted,
      doneTaskBorderColor: colors.border,
      critBkgColor: colors.destructive,
      critBorderColor: colors.destructive,
      todayLineColor: colors.primary,
      gridColor: colors.border,
      
      // Pie chart - use chart colors
      pie1: colors.chart1,
      pie2: colors.chart2,
      pie3: colors.chart3,
      pie4: colors.chart4,
      pie5: colors.chart5,
      pie6: colors.chart1,
      pie7: colors.chart2,
      pie8: colors.chart3,
      pie9: colors.chart4,
      pie10: colors.chart5,
      pie11: colors.chart1,
      pie12: colors.chart2,
      pieTitleTextSize: "16px",
      pieTitleTextColor: colors.foreground,
      pieSectionTextSize: "13px",
      pieSectionTextColor: colors.primaryForeground,
      pieLegendTextSize: "13px",
      pieLegendTextColor: colors.foreground,
      pieStrokeColor: colors.background,
      pieStrokeWidth: "2px",
      
      // Font sizes
      fontSize: "14px",
    },
  });

  mermaidInitialized = true;
  return mermaidInstance;
}

/**
 * Render a mermaid diagram to SVG
 */
async function renderDiagram(
  id: string,
  chart: string,
  theme: "light" | "dark"
): Promise<{ svg: string; bindFunctions?: (element: Element) => void }> {
  const mermaid = await initializeMermaid(theme);
  
  // Re-initialize if theme changed
  if (mermaidInitialized) {
    await initializeMermaid(theme);
  }

  return mermaid.render(id, chart);
}

/**
 * Validate mermaid syntax
 */
async function validateDiagram(chart: string): Promise<boolean> {
  if (!mermaidInstance) {
    await initializeMermaid("light");
  }
  
  try {
    await mermaidInstance!.parse(chart);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect diagram type from mermaid syntax
 */
function detectDiagramType(chart: string): string {
  const firstLine = chart.trim().split("\n")[0].toLowerCase();
  
  if (firstLine.includes("flowchart") || firstLine.includes("graph")) return "Flowchart";
  if (firstLine.includes("sequencediagram") || firstLine.includes("sequence")) return "Sequence";
  if (firstLine.includes("classDiagram") || firstLine.includes("class")) return "Class";
  if (firstLine.includes("stateDiagram") || firstLine.includes("state")) return "State";
  if (firstLine.includes("erDiagram") || firstLine.includes("er")) return "ER";
  if (firstLine.includes("gantt")) return "Gantt";
  if (firstLine.includes("pie")) return "Pie";
  if (firstLine.includes("mindmap")) return "Mindmap";
  if (firstLine.includes("timeline")) return "Timeline";
  if (firstLine.includes("gitgraph") || firstLine.includes("git")) return "Git";
  if (firstLine.includes("journey")) return "Journey";
  if (firstLine.includes("quadrant")) return "Quadrant";
  if (firstLine.includes("sankey")) return "Sankey";
  if (firstLine.includes("xychart") || firstLine.includes("xy")) return "XY Chart";
  if (firstLine.includes("block")) return "Block";
  
  return "Diagram";
}

// Loading skeleton component
const DiagramSkeleton = memo(function DiagramSkeleton() {
  return (
    <div className="flex items-center justify-center p-8 min-h-[200px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-secondary/50 animate-pulse" />
        <div className="h-4 w-32 bg-secondary/40 rounded animate-pulse" />
      </div>
    </div>
  );
});

// Error display component
const DiagramError = memo(function DiagramError({ 
  error, 
  chart,
  onRetry 
}: { 
  error: string; 
  chart: string;
  onRetry?: () => void;
}) {
  const [showSource, setShowSource] = useState(false);

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-destructive/10">
          <AlertCircle className="w-4 h-4 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-destructive">
            Failed to render diagram
          </p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {error}
          </p>
          <div className="flex items-center gap-2 mt-3">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="h-7 text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSource(!showSource)}
              className="h-7 text-xs"
            >
              {showSource ? "Hide" : "Show"} Source
            </Button>
          </div>
          {showSource && (
            <pre className="mt-3 p-3 rounded-lg bg-secondary/50 text-xs font-mono overflow-x-auto max-h-[200px]">
              {chart}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
});

// Toolbar component
const DiagramToolbar = memo(function DiagramToolbar({
  chart,
  diagramType,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFullscreen,
}: {
  chart: string;
  diagramType: string;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onFullscreen?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(chart);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [chart]);

  return (
    <div className="flex items-center justify-between px-5 py-2.5 border-b border-border/30 bg-secondary/30">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
          {diagramType}
        </span>
        <span className="text-[11px] text-muted-foreground tabular-nums bg-secondary/50 px-2 py-0.5 rounded-md">
          {Math.round(zoom * 100)}%
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomOut}
          disabled={zoom <= 0.5}
          className="h-7 w-7 p-0"
          title="Zoom out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomReset}
          className="h-7 w-7 p-0"
          title="Reset zoom"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomIn}
          disabled={zoom >= 2}
          className="h-7 w-7 p-0"
          title="Zoom in"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </Button>
        {onFullscreen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onFullscreen}
            className="h-7 w-7 p-0"
            title="Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
        )}
        <div className="w-px h-4 bg-border/50 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2 gap-1.5"
          title="Copy source"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs text-green-500">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
});

/**
 * Main Mermaid Diagram Component
 */
export const MermaidDiagram = memo(function MermaidDiagram({
  chart,
  className,
  title,
  showToolbar = true,
  errorFallback,
}: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useId();
  const diagramId = `mermaid-${uniqueId.replace(/:/g, "")}`;
  
  const { resolvedTheme } = useTheme();
  const theme = (resolvedTheme === "dark" ? "dark" : "light") as "light" | "dark";
  
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<MermaidError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [renderKey, setRenderKey] = useState(0);

  const diagramType = detectDiagramType(chart);

  // Render diagram
  useEffect(() => {
    let cancelled = false;

    async function render() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await renderDiagram(
          `${diagramId}-${renderKey}`,
          chart.trim(),
          theme
        );

        if (!cancelled) {
          setSvg(result.svg);
          setIsLoading(false);

          // Bind click handlers if any
          if (result.bindFunctions && containerRef.current) {
            result.bindFunctions(containerRef.current);
          }
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage = err instanceof Error 
            ? err.message 
            : "Unknown error rendering diagram";
          setError({ message: errorMessage });
          setIsLoading(false);
        }
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [chart, theme, diagramId, renderKey]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z + 0.25, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z - 0.25, 0.5));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
  }, []);

  const handleRetry = useCallback(() => {
    setRenderKey((k) => k + 1);
  }, []);

  // Error state
  if (error) {
    if (errorFallback) {
      return <>{errorFallback}</>;
    }
    return (
      <DiagramError 
        error={error.message} 
        chart={chart} 
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-gradient-to-b from-background to-secondary/20 overflow-hidden my-6 shadow-sm",
        "dark:from-background dark:to-secondary/10 dark:border-border/30",
        className
      )}
    >
      {/* Title */}
      {title && (
        <div className="px-5 py-3 border-b border-border/30 bg-secondary/30">
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        </div>
      )}

      {/* Toolbar */}
      {showToolbar && !isLoading && (
        <DiagramToolbar
          chart={chart}
          diagramType={diagramType}
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
        />
      )}

      {/* Diagram container */}
      <div
        ref={containerRef}
        className={cn(
          "relative overflow-auto p-6",
          "min-h-[180px] max-h-[650px]",
          "[&_svg]:mx-auto [&_svg]:max-w-full",
          // Improve SVG rendering
          "[&_svg_text]:font-sans",
          "[&_svg_.node_rect]:rx-[8px]",
          "[&_svg_.node_polygon]:rx-[4px]",
        )}
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
        }}
      >
        {isLoading ? (
          <DiagramSkeleton />
        ) : svg ? (
          <div
            dangerouslySetInnerHTML={{ __html: svg }}
            className="flex items-center justify-center [&_svg]:drop-shadow-sm"
          />
        ) : null}
      </div>
    </div>
  );
});

// Export utilities
export { validateDiagram, detectDiagramType };
export type { MermaidDiagramProps };
