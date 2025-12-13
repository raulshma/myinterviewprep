'use client';

import { Focus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useZenMode } from './zen-mode-context';

interface ZenModeToggleProps {
  className?: string;
}

export function ZenModeToggle({ className }: ZenModeToggleProps) {
  const { enterZenMode } = useZenMode();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={enterZenMode}
          className={className}
        >
          <Focus className="w-4 h-4 mr-2" />
          Zen Mode
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Focus on content in fullscreen mode</p>
      </TooltipContent>
    </Tooltip>
  );
}
