'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp, Eye, Search, Clock, Cpu } from 'lucide-react';
import type { AILogWithDetails } from '@/lib/actions/admin';

interface AILogViewerProps {
  logs: AILogWithDetails[];
}

function getActionBadgeVariant(action: string): 'default' | 'secondary' | 'outline' {
  switch (action) {
    case 'GENERATE_BRIEF':
      return 'default';
    case 'GENERATE_TOPICS':
      return 'secondary';
    case 'GENERATE_MCQ':
    case 'GENERATE_RAPID_FIRE':
      return 'outline';
    default:
      return 'outline';
  }
}

function formatAction(action: string): string {
  return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AILogViewer({ logs }: AILogViewerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]"></TableHead>
          <TableHead>Timestamp</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Model</TableHead>
          <TableHead>Tokens</TableHead>
          <TableHead>Latency</TableHead>
          <TableHead>Tools</TableHead>
          <TableHead className="w-[80px]">Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <>
            <TableRow key={log._id} className="cursor-pointer hover:bg-muted/50">
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => toggleExpand(log._id)}
                >
                  {expandedId === log._id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {log.formattedTimestamp}
              </TableCell>
              <TableCell>
                <Badge variant={getActionBadgeVariant(log.action)} className="font-mono text-xs">
                  {formatAction(log.action)}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-xs">{log.model}</TableCell>
              <TableCell className="font-mono text-xs">
                <span className="text-green-500">{log.tokenUsage.input}</span>
                {' / '}
                <span className="text-blue-500">{log.tokenUsage.output}</span>
              </TableCell>
              <TableCell className="font-mono text-xs">
                {log.latencyMs}ms
              </TableCell>
              <TableCell>
                {log.toolsUsed.length > 0 ? (
                  <Badge variant="outline" className="text-xs">
                    <Search className="w-3 h-3 mr-1" />
                    {log.toolsUsed.length}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-xs">-</span>
                )}
              </TableCell>
              <TableCell>
                <LogDetailDialog log={log} />
              </TableCell>
            </TableRow>
            {expandedId === log._id && (
              <TableRow key={`${log._id}-expanded`}>
                <TableCell colSpan={8} className="bg-muted/30 p-4">
                  <ExpandedLogContent log={log} />
                </TableCell>
              </TableRow>
            )}
          </>
        ))}
      </TableBody>
    </Table>
  );
}


function ExpandedLogContent({ log }: { log: AILogWithDetails }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            Request Details
          </h4>
          <div className="space-y-1 text-xs">
            <p><span className="text-muted-foreground">Interview ID:</span> {log.interviewId}</p>
            <p><span className="text-muted-foreground">User ID:</span> {log.userId}</p>
            <p><span className="text-muted-foreground">Model:</span> {log.model}</p>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Performance
          </h4>
          <div className="space-y-1 text-xs">
            <p><span className="text-muted-foreground">Latency:</span> {log.latencyMs}ms</p>
            <p><span className="text-muted-foreground">Input Tokens:</span> {log.tokenUsage.input}</p>
            <p><span className="text-muted-foreground">Output Tokens:</span> {log.tokenUsage.output}</p>
          </div>
        </div>
      </div>
      
      {log.searchQueries.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search Queries
          </h4>
          <div className="flex flex-wrap gap-2">
            {log.searchQueries.map((query, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {query}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <div>
        <h4 className="text-sm font-medium mb-2">Prompt Preview</h4>
        <pre className="text-xs bg-background p-3 rounded border overflow-x-auto max-h-32">
          {log.prompt.slice(0, 500)}{log.prompt.length > 500 ? '...' : ''}
        </pre>
      </div>
    </div>
  );
}

function LogDetailDialog({ log }: { log: AILogWithDetails }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-mono">
            AI Log: {formatAction(log.action)}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <div className="space-y-6 p-4">
            {/* Metadata */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Timestamp</p>
                <p className="font-mono text-sm">{log.formattedTimestamp}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Model</p>
                <p className="font-mono text-sm">{log.model}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Latency</p>
                <p className="font-mono text-sm">{log.latencyMs}ms</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Input Tokens</p>
                <p className="font-mono text-sm text-green-500">{log.tokenUsage.input}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Output Tokens</p>
                <p className="font-mono text-sm text-blue-500">{log.tokenUsage.output}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tools Used</p>
                <p className="font-mono text-sm">{log.toolsUsed.join(', ') || 'None'}</p>
              </div>
            </div>

            {/* Search Queries */}
            {log.searchQueries.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Search Queries</h4>
                <div className="flex flex-wrap gap-2">
                  {log.searchQueries.map((query, i) => (
                    <Badge key={i} variant="secondary">
                      {query}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Full Prompt */}
            <div>
              <h4 className="text-sm font-medium mb-2">Full Prompt</h4>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                {log.prompt}
              </pre>
            </div>

            {/* Full Response */}
            <div>
              <h4 className="text-sm font-medium mb-2">Full Response</h4>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                {log.response}
              </pre>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
