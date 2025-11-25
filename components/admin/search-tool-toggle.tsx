'use client';

import { useState, useTransition } from 'react';
import { Switch } from '@/components/ui/switch';
import { toggleSearchTool } from '@/lib/actions/admin';
import { Spinner } from '@/components/ui/spinner';

interface SearchToolToggleProps {
  initialEnabled: boolean;
}

export function SearchToolToggle({ initialEnabled }: SearchToolToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (checked: boolean) => {
    startTransition(async () => {
      const result = await toggleSearchTool(checked);
      if (result.success) {
        setEnabled(result.enabled);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={enabled}
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
      {isPending && <Spinner className="w-4 h-4" />}
    </div>
  );
}
