"use client";

import { useState, useEffect } from "react";
import { Palette, Trash2, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { useCustomTheme } from "@/hooks/use-custom-theme";
import { useToast } from "@/hooks/use-toast";

export function CustomThemeSection() {
  const {
    customCSS,
    setCustomCSS,
    clearCustomTheme,
    isLoaded,
    hasCustomTheme,
  } = useCustomTheme();
  const [inputValue, setInputValue] = useState("");
  const { toast } = useToast();

  // Sync input with stored value when loaded
  useEffect(() => {
    if (isLoaded && customCSS) {
      setInputValue(customCSS);
    }
  }, [isLoaded, customCSS]);

  const handleApply = () => {
    if (!inputValue.trim()) {
      toast({
        title: "No CSS provided",
        description: "Please paste your shadcn theme CSS first.",
        variant: "destructive",
      });
      return;
    }

    // Basic validation - check for CSS variable patterns
    if (!inputValue.includes("--") || !inputValue.includes(":")) {
      toast({
        title: "Invalid CSS",
        description: "The CSS doesn't appear to contain valid CSS variables.",
        variant: "destructive",
      });
      return;
    }

    setCustomCSS(inputValue);
    // Dispatch event for same-tab updates
    window.dispatchEvent(new CustomEvent("custom-theme-update"));
    toast({
      title: "Theme applied",
      description: "Your custom theme has been saved and applied.",
    });
  };

  const handleClear = () => {
    clearCustomTheme();
    setInputValue("");
    window.dispatchEvent(new CustomEvent("custom-theme-update"));
    toast({
      title: "Theme cleared",
      description: "Custom theme removed. Default theme restored.",
    });
  };

  if (!isLoaded) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-card/50 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl hover:border-primary/20 transition-all duration-300 shadow-sm"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
          <Palette className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Custom Theme</h2>
          <p className="text-sm text-muted-foreground">
            Paste CSS from{" "}
            <a
              href="https://ui.shadcn.com/themes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline underline-offset-4 inline-flex items-center gap-1"
            >
              shadcn/ui themes
              <ExternalLink className="h-3 w-3" />
            </a>{" "}
            to customize.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Textarea
            placeholder={`:root {
  --background: oklch(0.91 0.05 82.78);
  --foreground: oklch(0.41 0.08 78.86);
  /* ... paste your full theme CSS here */
}`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            rows={10}
            className="font-mono text-xs min-h-[200px] bg-secondary/30 border-white/10 focus:border-primary/30 focus:ring-0 resize-y rounded-2xl p-4 leading-relaxed"
          />
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleApply}
            className="flex-1 rounded-full h-11 font-medium shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Check className="h-4 w-4 mr-2" />
            Apply Theme
          </Button>
          {hasCustomTheme && (
            <Button
              variant="outline"
              onClick={handleClear}
              className="flex-1 rounded-full h-11 bg-transparent border-white/10 hover:bg-secondary/50 hover:border-primary/20 transition-all"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Theme
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
