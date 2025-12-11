"use client";

import { useState, useRef, useEffect } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ModelSelector } from "../model-selector";
import { cn } from "@/lib/utils";
import type { AIProviderType } from "@/lib/ai/types";

interface MessageEditorProps {
  initialContent: string;
  isMaxPlan?: boolean;
  selectedModelId?: string | null;
  onModelSelect?: (modelId: string, supportsImages: boolean, provider: AIProviderType) => void;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export function MessageEditor({
  initialContent,
  isMaxPlan,
  selectedModelId,
  onModelSelect,
  onSave,
  onCancel,
}: MessageEditorProps) {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      // Auto-resize textarea
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  const handleSave = () => {
    const trimmed = content.trim();
    if (trimmed && trimmed !== initialContent) {
      onSave(trimmed);
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const needsModelSelection = isMaxPlan && !selectedModelId;

  return (
    <div className="space-y-3">
      {/* Model selector prompt for MAX users without selection */}
      {needsModelSelection && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Select an AI model before saving
          </p>
        </div>
      )}

      {/* Editor */}
      <div
        className={cn(
          "relative bg-muted/30 border border-border/50 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all rounded-2xl p-3"
        )}
      >
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Edit your message..."
          className="border-0 bg-transparent focus-visible:ring-0 resize-none text-sm px-1 py-1 shadow-none min-h-[60px]"
          rows={1}
        />

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border/40">
          <div className="flex items-center gap-1">
            {isMaxPlan && onModelSelect && (
              <ModelSelector
                selectedModelId={selectedModelId ?? null}
                onModelSelect={onModelSelect}
              />
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-7 rounded-full px-3 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!content.trim() || needsModelSelection}
              className="h-7 rounded-full px-3 text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Save & Send
            </Button>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground/70">
        Press <kbd className="px-1 py-0.5 rounded bg-muted text-[9px]">Cmd/Ctrl+Enter</kbd> to save, <kbd className="px-1 py-0.5 rounded bg-muted text-[9px]">Esc</kbd> to cancel
      </p>
    </div>
  );
}
