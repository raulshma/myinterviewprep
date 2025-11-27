'use client';

import { useState } from 'react';
import { Code, ChevronRight, Copy, Check } from 'lucide-react';
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
import type { CodingChallenge } from '@/lib/db/schemas/learning-path';

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

interface CodingChallengeViewProps {
  content: CodingChallenge;
  language?: string;
  onComplete: (answer: string, isCorrect?: boolean) => void;
}

export function CodingChallengeView({ 
  content, 
  language: initialLanguage = 'typescript',
  onComplete 
}: CodingChallengeViewProps) {
  const [code, setCode] = useState(content.starterCode || '');
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState(initialLanguage);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    onComplete(code);
  };

  return (
    <div className="space-y-6">
      {/* Problem Description */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-lg text-foreground font-medium">{content.problemDescription}</p>
      </div>

      {/* Input/Output Format */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border border-border bg-secondary/30">
          <h4 className="text-sm font-mono text-muted-foreground mb-2">Input Format</h4>
          <p className="text-sm text-foreground">{content.inputFormat}</p>
        </div>
        <div className="p-4 border border-border bg-secondary/30">
          <h4 className="text-sm font-mono text-muted-foreground mb-2">Output Format</h4>
          <p className="text-sm text-foreground">{content.outputFormat}</p>
        </div>
      </div>

      {/* Sample Input/Output */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border border-border bg-card">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-mono text-muted-foreground">Sample Input</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(content.sampleInput)}
              className="h-6 px-2"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
          <pre className="text-sm font-mono text-foreground bg-secondary/50 p-3 overflow-x-auto">
            {content.sampleInput}
          </pre>
        </div>
        <div className="p-4 border border-border bg-card">
          <h4 className="text-sm font-mono text-muted-foreground mb-2">Sample Output</h4>
          <pre className="text-sm font-mono text-foreground bg-secondary/50 p-3 overflow-x-auto">
            {content.sampleOutput}
          </pre>
        </div>
      </div>

      {/* Evaluation Criteria */}
      <div className="p-4 border border-border bg-secondary/20">
        <h4 className="text-sm font-mono text-muted-foreground mb-3">Evaluation Criteria</h4>
        <div className="flex flex-wrap gap-2">
          {content.evaluationCriteria.map((criteria, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {criteria}
            </Badge>
          ))}
        </div>
      </div>

      {/* Code Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-mono text-muted-foreground flex items-center gap-2">
            <Code className="w-4 h-4" />
            Your Solution
          </h4>
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
            value={code}
            onChange={setCode}
            language={language}
            height="300px"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button onClick={handleSubmit}>
          Submit Solution
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
