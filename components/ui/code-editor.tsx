'use client';

import { useTheme } from 'next-themes';
import Editor, { type OnMount, type OnChange, loader } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';

// Configure Monaco loader to use CDN with all languages
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.0/min/vs',
  },
});

// Track registered completion providers to avoid duplicates
const registeredProviders = new Set<string>();

// Map common language names to Monaco language identifiers
const languageMap: Record<string, string> = {
  typescript: 'typescript',
  ts: 'typescript',
  javascript: 'javascript',
  js: 'javascript',
  python: 'python',
  py: 'python',
  java: 'java',
  cpp: 'cpp',
  'c++': 'cpp',
  c: 'c',
  csharp: 'csharp',
  'c#': 'csharp',
  cs: 'csharp',
  dotnet: 'csharp',
  go: 'go',
  golang: 'go',
  rust: 'rust',
  rs: 'rust',
  ruby: 'ruby',
  rb: 'ruby',
  php: 'php',
  swift: 'swift',
  kotlin: 'kotlin',
  kt: 'kotlin',
  scala: 'scala',
  sql: 'sql',
  html: 'html',
  css: 'css',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  markdown: 'markdown',
  md: 'markdown',
  shell: 'shell',
  bash: 'shell',
  sh: 'shell',
};

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  height?: string | number;
  readOnly?: boolean;
  className?: string;
  placeholder?: string;
}

export function CodeEditor({
  value,
  onChange,
  language = 'typescript',
  height = '300px',
  readOnly = false,
  className,
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme();

  // Normalize language to Monaco identifier
  const monacoLanguage = languageMap[language.toLowerCase()] || language.toLowerCase();

  const handleChange: OnChange = (newValue) => {
    if (onChange && newValue !== undefined) {
      onChange(newValue);
    }
  };

  const handleMount: OnMount = (editor, monaco) => {
    // Configure editor settings on mount
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: 'on',
      renderLineHighlight: 'line',
      tabSize: 2,
      wordWrap: 'on',
      automaticLayout: true,
      padding: { top: 12, bottom: 12 },
    });

    // Set up TypeScript/JavaScript compiler options
    if (monacoLanguage === 'typescript' || monacoLanguage === 'javascript') {
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.Latest,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        allowJs: true,
        typeRoots: ['node_modules/@types'],
      });
    }

    // Register C# snippets and basic completions (only once)
    if (monacoLanguage === 'csharp' && !registeredProviders.has('csharp')) {
      registeredProviders.add('csharp');
      monaco.languages.registerCompletionItemProvider('csharp', {
        provideCompletionItems: (model: Parameters<Parameters<typeof monaco.languages.registerCompletionItemProvider>[1]['provideCompletionItems']>[0], position: Parameters<Parameters<typeof monaco.languages.registerCompletionItemProvider>[1]['provideCompletionItems']>[1]) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          const suggestions = [
            // Keywords
            ...['public', 'private', 'protected', 'internal', 'static', 'void', 'class', 'interface', 'struct', 'enum', 'namespace', 'using', 'return', 'if', 'else', 'for', 'foreach', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'base', 'null', 'true', 'false', 'async', 'await', 'var', 'const', 'readonly', 'override', 'virtual', 'abstract', 'sealed'].map(keyword => ({
              label: keyword,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: keyword,
              range,
            })),
            // Types
            ...['string', 'int', 'bool', 'double', 'float', 'decimal', 'char', 'byte', 'long', 'short', 'object', 'dynamic', 'List', 'Dictionary', 'Task', 'Action', 'Func', 'IEnumerable', 'IList', 'ICollection'].map(type => ({
              label: type,
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: type,
              range,
            })),
            // Common methods
            ...['Console.WriteLine', 'Console.ReadLine', 'ToString', 'Equals', 'GetHashCode', 'GetType'].map(method => ({
              label: method,
              kind: monaco.languages.CompletionItemKind.Method,
              insertText: method,
              range,
            })),
          ];

          return { suggestions };
        },
      });
    }
  };

  return (
    <div className={className}>
      <Editor
        height={height}
        language={monacoLanguage}
        value={value}
        onChange={handleChange}
        onMount={handleMount}
        theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
        loading={
          <div className="flex items-center justify-center h-full bg-secondary/30">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        }
        options={{
          readOnly,
          domReadOnly: readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          tabSize: 2,
          wordWrap: 'on',
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
