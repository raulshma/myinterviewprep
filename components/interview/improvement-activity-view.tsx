"use client";

/**
 * Improvement Activity View Component
 * Renders different activity types (MCQ, coding challenge, debugging, concept explanation)
 * Requirements: 3.3, 4.1
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  Sparkles,
  Code,
  Bug,
  BookOpen,
  Lightbulb,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeHighlighter, detectLanguage } from "@/components/ui/code-highlighter";
import { StaticMarkdown } from "@/components/streaming/markdown-renderer";
import type { ActivityContent } from "@/lib/db/schemas/learning-path";

interface ImprovementActivityViewProps {
  content: ActivityContent | Partial<ActivityContent>;
  isStreaming: boolean;
  onComplete: (score?: number) => void;
}

// Type guards for activity content
function isMCQActivity(
  content: ActivityContent | Partial<ActivityContent>
): content is {
  type: "mcq";
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
} {
  return content.type === "mcq" && "question" in content;
}

function isCodingChallenge(
  content: ActivityContent | Partial<ActivityContent>
): content is {
  type: "coding-challenge";
  problemDescription: string;
  inputFormat: string;
  outputFormat: string;
  evaluationCriteria: string[];
  sampleInput: string;
  sampleOutput: string;
} {
  return content.type === "coding-challenge" && "problemDescription" in content;
}

function isDebuggingTask(
  content: ActivityContent | Partial<ActivityContent>
): content is {
  type: "debugging-task";
  buggyCode: string;
  expectedBehavior: string;
  hints: string[];
} {
  return content.type === "debugging-task" && "buggyCode" in content;
}

function isConceptExplanation(
  content: ActivityContent | Partial<ActivityContent>
): content is {
  type: "concept-explanation";
  content: string;
  keyPoints: string[];
  examples: string[];
} {
  return content.type === "concept-explanation" && "keyPoints" in content;
}

// MCQ Activity Component
function MCQActivityContent({
  content,
  isStreaming,
  onComplete,
}: {
  content: {
    type: "mcq";
    question?: string;
    options?: string[];
    correctAnswer?: string;
    explanation?: string;
  };
  isStreaming: boolean;
  onComplete: (score?: number) => void;
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isCorrect = selectedOption === content.correctAnswer;

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);
  };

  const handleContinue = () => {
    onComplete(isCorrect ? 100 : 0);
  };

  return (
    <div className="space-y-6">
      {/* Question */}
      <p className="text-lg font-medium text-foreground leading-relaxed">
        {content.question || "Loading question..."}
      </p>

      {/* Options */}
      {content.options && content.options.length > 0 && (
        <div className="space-y-3">
          {content.options.map((option, index) => {
            const isSelected = selectedOption === option;
            const isCorrectOption = option === content.correctAnswer;
            const showResult = isSubmitted && !isStreaming;

            return (
              <motion.button
                key={index}
                type="button"
                onClick={() =>
                  !isSubmitted && !isStreaming && setSelectedOption(option)
                }
                disabled={isSubmitted || isStreaming}
                className={`w-full text-left transition-all duration-300 ${
                  isSubmitted || isStreaming
                    ? "cursor-default"
                    : "cursor-pointer"
                }`}
                whileHover={!isSubmitted && !isStreaming ? { scale: 1.01 } : {}}
              >
                <div
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                    showResult && isCorrectOption
                      ? "border-green-500/50 bg-green-500/5"
                      : showResult && isSelected && !isCorrectOption
                      ? "border-destructive/50 bg-destructive/5"
                      : isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border/40 bg-secondary/20 hover:border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg font-medium text-sm ${
                        showResult && isCorrectOption
                          ? "bg-green-500 text-white"
                          : showResult && isSelected && !isCorrectOption
                          ? "bg-destructive text-white"
                          : isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/60 text-muted-foreground"
                      }`}
                    >
                      {showResult && isCorrectOption ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : showResult && isSelected && !isCorrectOption ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </div>
                    <span className="flex-1 text-sm">{option}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Explanation */}
      <AnimatePresence>
        {isSubmitted && content.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border ${
              isCorrect
                ? "border-green-500/30 bg-green-500/5"
                : "border-destructive/30 bg-destructive/5"
            }`}
          >
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={`font-medium mb-1 ${
                    isCorrect ? "text-green-600" : "text-destructive"
                  }`}
                >
                  {isCorrect ? "Correct!" : "Not quite right"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {content.explanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      {!isStreaming && (
        <div className="flex justify-end pt-2">
          {!isSubmitted ? (
            <Button onClick={handleSubmit} disabled={!selectedOption}>
              Check Answer
            </Button>
          ) : (
            <Button onClick={handleContinue} className="gap-2">
              Complete Activity
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Coding Challenge Component
function CodingChallengeContent({
  content,
  isStreaming,
  onComplete,
}: {
  content: {
    type: "coding-challenge";
    problemDescription?: string;
    inputFormat?: string;
    outputFormat?: string;
    evaluationCriteria?: string[];
    sampleInput?: string;
    sampleOutput?: string;
  };
  isStreaming: boolean;
  onComplete: (score?: number) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <Code className="w-5 h-5" />
        <span className="font-medium">Coding Challenge</span>
      </div>

      {/* Problem Description */}
      <div>
        <h4 className="font-medium text-foreground mb-2">Problem</h4>
        <p className="text-muted-foreground leading-relaxed">
          {content.problemDescription || "Loading problem description..."}
        </p>
      </div>

      {/* Input/Output Format */}
      {(content.inputFormat || content.outputFormat) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.inputFormat && (
            <div className="bg-secondary/30 rounded-xl p-4">
              <h5 className="text-sm font-medium text-foreground mb-2">
                Input Format
              </h5>
              <p className="text-sm text-muted-foreground">
                {content.inputFormat}
              </p>
            </div>
          )}
          {content.outputFormat && (
            <div className="bg-secondary/30 rounded-xl p-4">
              <h5 className="text-sm font-medium text-foreground mb-2">
                Output Format
              </h5>
              <p className="text-sm text-muted-foreground">
                {content.outputFormat}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sample I/O */}
      {(content.sampleInput || content.sampleOutput) && (
        <div className="bg-secondary/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-medium text-foreground">Sample</h5>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                copyToClipboard(
                  `Input:\n${content.sampleInput}\n\nOutput:\n${content.sampleOutput}`
                )
              }
              className="h-7 text-xs"
            >
              {copied ? (
                <Check className="w-3 h-3 mr-1" />
              ) : (
                <Copy className="w-3 h-3 mr-1" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="space-y-2 font-mono text-sm">
            {content.sampleInput && (
              <div>
                <span className="text-muted-foreground">Input: </span>
                <span className="text-foreground">{content.sampleInput}</span>
              </div>
            )}
            {content.sampleOutput && (
              <div>
                <span className="text-muted-foreground">Output: </span>
                <span className="text-foreground">{content.sampleOutput}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Evaluation Criteria */}
      {content.evaluationCriteria && content.evaluationCriteria.length > 0 && (
        <div>
          <h4 className="font-medium text-foreground mb-2">
            Evaluation Criteria
          </h4>
          <ul className="space-y-1">
            {content.evaluationCriteria.map((criterion, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                {criterion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      {!isStreaming && (
        <div className="flex justify-end pt-2">
          <Button onClick={() => onComplete(70)} className="gap-2">
            Mark as Practiced
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Debugging Task Component
function DebuggingTaskContent({
  content,
  isStreaming,
  onComplete,
}: {
  content: {
    type: "debugging-task";
    buggyCode?: string;
    expectedBehavior?: string;
    hints?: string[];
  };
  isStreaming: boolean;
  onComplete: (score?: number) => void;
}) {
  const [showHints, setShowHints] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-orange-500">
        <Bug className="w-5 h-5" />
        <span className="font-medium">Debugging Task</span>
      </div>

      {/* Expected Behavior */}
      {content.expectedBehavior && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <h4 className="font-medium text-foreground mb-2">
            Expected Behavior
          </h4>
          <p className="text-sm text-muted-foreground">
            {content.expectedBehavior}
          </p>
        </div>
      )}

      {/* Buggy Code */}
      {content.buggyCode && (
        <div className="bg-secondary/30 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
            <span className="text-sm font-medium text-foreground">
              Buggy Code
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(content.buggyCode || "")}
              className="h-7 text-xs"
            >
              {copied ? (
                <Check className="w-3 h-3 mr-1" />
              ) : (
                <Copy className="w-3 h-3 mr-1" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <CodeHighlighter
            code={content.buggyCode}
            language={detectLanguage(content.buggyCode)}
          />
        </div>
      )}

      {/* Hints */}
      {content.hints && content.hints.length > 0 && (
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHints(!showHints)}
            className="gap-2"
          >
            <Lightbulb className="w-4 h-4" />
            {showHints ? "Hide Hints" : "Show Hints"}
          </Button>
          <AnimatePresence>
            {showHints && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-2"
              >
                {content.hints.map((hint, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                  >
                    <Lightbulb className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">{hint}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Actions */}
      {!isStreaming && (
        <div className="flex justify-end pt-2">
          <Button onClick={() => onComplete(70)} className="gap-2">
            Mark as Practiced
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Concept Explanation Component
function ConceptExplanationContent({
  content,
  isStreaming,
  onComplete,
}: {
  content: {
    type: "concept-explanation";
    content?: string;
    keyPoints?: string[];
    examples?: string[];
  };
  isStreaming: boolean;
  onComplete: (score?: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-blue-500">
        <BookOpen className="w-5 h-5" />
        <span className="font-medium">Concept Explanation</span>
      </div>

      {/* Main Content */}
      {content.content && (
        <StaticMarkdown
          content={content.content}
          proseClassName="prose-sm text-muted-foreground"
        />
      )}

      {/* Key Points */}
      {content.keyPoints && content.keyPoints.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <h4 className="font-medium text-foreground mb-3">Key Takeaways</h4>
          <ul className="space-y-2">
            {content.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Examples */}
      {content.examples && content.examples.length > 0 && (
        <div>
          <h4 className="font-medium text-foreground mb-3">Examples</h4>
          <div className="space-y-3">
            {content.examples.map((example, index) => (
              <div key={index} className="p-4 bg-secondary/30 rounded-xl">
                <Badge variant="outline" className="mb-2">
                  Example {index + 1}
                </Badge>
                <p className="text-sm text-muted-foreground">{example}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {!isStreaming && (
        <div className="flex justify-end pt-2">
          <Button onClick={() => onComplete(100)} className="gap-2">
            I Understand
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Main Component
export function ImprovementActivityView({
  content,
  isStreaming,
  onComplete,
}: ImprovementActivityViewProps) {
  if (!content || !content.type) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading activity content...
      </div>
    );
  }

  if (isMCQActivity(content)) {
    return (
      <MCQActivityContent
        content={content}
        isStreaming={isStreaming}
        onComplete={onComplete}
      />
    );
  }

  if (isCodingChallenge(content)) {
    return (
      <CodingChallengeContent
        content={content}
        isStreaming={isStreaming}
        onComplete={onComplete}
      />
    );
  }

  if (isDebuggingTask(content)) {
    return (
      <DebuggingTaskContent
        content={content}
        isStreaming={isStreaming}
        onComplete={onComplete}
      />
    );
  }

  if (isConceptExplanation(content)) {
    return (
      <ConceptExplanationContent
        content={content}
        isStreaming={isStreaming}
        onComplete={onComplete}
      />
    );
  }

  // Fallback for partial content during streaming
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Generating {content.type?.replace(/-/g, " ")} activity...
      </div>
      {content.type === "mcq" && "question" in content && content.question && (
        <p className="text-foreground">{content.question}</p>
      )}
      {content.type === "coding-challenge" &&
        "problemDescription" in content &&
        content.problemDescription && (
          <p className="text-foreground">{content.problemDescription}</p>
        )}
    </div>
  );
}
