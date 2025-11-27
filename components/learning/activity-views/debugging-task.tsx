'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bug, ChevronRight, Lightbulb, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodeEditor } from '@/components/ui/code-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DebuggingTask } from '@/lib/db/schemas/learning-path';

const SUPPORTED_LANGUAGES = [
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'scala', label: 'Scala' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'shell', label: 'Shell/Bash' },
];

interface DebuggingTaskViewProps {
  content: DebuggingTask;
  language?: string;
  onComplete: (answer: string, isCorrect?: boolean) => void;
}

export function DebuggingTaskView({ 
  content, 
  language: initialLanguage = 'typescript',
  onComplete 
}: DebuggingTaskViewProps) {
  const [fixedCode, setFixedCode] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [language, setLanguage] = useState(initialLanguage);

  const handleRevealHint = (index: number) => {
    if (!revealedHints.includes(index)) {
      setRevealedHints([...revealedHints, index]);
    }
  };

  const handleSubmit = () => {
    onComplete(fixedCode);
  };

  return (
    <div className="space-y-6">
      {/* Expected Behavior */}
      <div className="p-4 border border-primary/30 bg-primary/5">
        <h4 className="text-sm font-mono text-primary mb-2 flex items-center gap-2">
          <Bug className="w-4 h-4" />
          Expected Behavior
        </h4>
        <p className="text-foreground">{content.expectedBehavior}</p>
      </div>

      {/* Buggy Code */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-mono text-muted-foreground">Buggy Code</h4>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-mono">
              {language}
            </Badge>
            <span className="text-xs px-2 py-1 bg-destructive/20 text-destructive font-mono">
              Contains Bug(s)
            </span>
          </div>
        </div>
        <div className="border border-destructive/30">
          <CodeEditor
            value={content.buggyCode}
            language={language}
            height="200px"
            readOnly
          />
        </div>
      </div>

      {/* Hints */}
      {content.hints && content.hints.length > 0 && (
        <div className="space-y-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHints(!showHints)}
            className="gap-2"
          >
            <Lightbulb className="w-4 h-4" />
            {showHints ? 'Hide Hints' : 'Show Hints'}
            {showHints ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>

          {showHints && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              {content.hints.map((hint, index) => (
                <div
                  key={index}
                  className="p-3 border border-border bg-secondary/20"
                >
                  {revealedHints.includes(index) ? (
                    <p className="text-sm text-foreground">{hint}</p>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevealHint(index)}
                      className="text-muted-foreground"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Reveal Hint {index + 1}
                    </Button>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* Fixed Code Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-mono text-muted-foreground">Your Fixed Code</h4>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[140px] h-8 text-xs font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value} className="text-xs font-mono">
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="border border-border">
          <CodeEditor
            value={fixedCode}
            onChange={setFixedCode}
            language={language}
            height="250px"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button onClick={handleSubmit}>
          Submit Fix
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
