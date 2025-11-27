"use client";

/**
 * Code Highlighter Component
 * Uses Shiki for syntax highlighting with dual theme support
 */

import { useEffect, useState, useCallback } from "react";
import { getHighlighter, type Highlighter } from "shiki";
import { cn } from "@/lib/utils";

interface CodeHighlighterProps {
  code: string;
  language?: string;
  className?: string;
  showLineNumbers?: boolean;
}

// Cache the highlighter instance
let highlighterPromise: Promise<Highlighter> | null = null;

function getShikiHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = getHighlighter({
      themes: ["github-light", "github-dark"],
      langs: [
        "typescript", "javascript", "python", "java", "cpp", "c", 
        "go", "rust", "sql", "json", "html", "css", "bash", "text"
      ],
    });
  }
  return highlighterPromise;
}

export function CodeHighlighter({
  code,
  language = "typescript",
  className,
  showLineNumbers = false,
}: CodeHighlighterProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const highlight = useCallback(async () => {
    try {
      const highlighter = await getShikiHighlighter();
      const loadedLangs = highlighter.getLoadedLanguages();
      const langToUse = loadedLangs.includes(language as never) ? language : "text";
      
      const highlighted = highlighter.codeToHtml(code, {
        lang: langToUse,
        themes: {
          light: "github-light",
          dark: "github-dark",
        },
        defaultColor: false,
      });

      setHtml(highlighted);
    } catch (error) {
      console.warn(`Shiki highlighting failed:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [code, language]);

  useEffect(() => {
    highlight();
  }, [highlight]);

  if (isLoading || !html) {
    return (
      <pre
        className={cn(
          "bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono",
          "scrollbar-thin scrollbar-track-muted scrollbar-thumb-muted-foreground/30",
          className
        )}
      >
        <code className="whitespace-pre-wrap break-words">{code}</code>
      </pre>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden",
        "[&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:max-w-full",
        "[&_pre]:scrollbar-thin [&_pre]:scrollbar-track-muted [&_pre]:scrollbar-thumb-muted-foreground/30",
        "[&_code]:text-sm [&_code]:font-mono",
        showLineNumbers && "[&_pre]:pl-12",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Detect programming language from code content
 */
export function detectLanguage(code: string): string {
  const trimmed = code.trim().toLowerCase();
  
  // Python indicators
  if (trimmed.includes("def ") || trimmed.includes("import ") && trimmed.includes(":") || trimmed.includes("print(")) {
    return "python";
  }
  
  // JavaScript/TypeScript indicators
  if (trimmed.includes("const ") || trimmed.includes("let ") || trimmed.includes("function ") || trimmed.includes("=>")) {
    if (trimmed.includes(": ") && (trimmed.includes("interface ") || trimmed.includes("type "))) {
      return "typescript";
    }
    return "javascript";
  }
  
  // Java indicators
  if (trimmed.includes("public class ") || trimmed.includes("public static void main")) {
    return "java";
  }
  
  // C++ indicators
  if (trimmed.includes("#include") || trimmed.includes("std::") || trimmed.includes("cout <<")) {
    return "cpp";
  }
  
  // SQL indicators
  if (trimmed.includes("select ") && trimmed.includes("from ") || trimmed.includes("create table")) {
    return "sql";
  }
  
  // Go indicators
  if (trimmed.includes("func ") && trimmed.includes("package ")) {
    return "go";
  }
  
  // Rust indicators
  if (trimmed.includes("fn ") && trimmed.includes("let mut ")) {
    return "rust";
  }
  
  return "typescript"; // Default fallback
}
