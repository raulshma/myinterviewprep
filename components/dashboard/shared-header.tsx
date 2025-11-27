'use client';

import { useEffect } from 'react';
import { useSharedHeader, type HeaderConfig } from './shared-header-context';

export function SharedHeader() {
  const { config, setHeader } = useSharedHeader();

  // Listen for header updates from ViewTransitionLink
  useEffect(() => {
    const handleHeaderUpdate = (e: CustomEvent<Omit<HeaderConfig, 'visible' | 'actions'>>) => {
      setHeader(e.detail);
    };

    window.addEventListener('header-update', handleHeaderUpdate as EventListener);
    return () => {
      window.removeEventListener('header-update', handleHeaderUpdate as EventListener);
    };
  }, [setHeader]);

  if (!config?.visible) {
    return null;
  }

  const BadgeIcon = config.badgeIcon;

  return (
    <div className="mb-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div className="space-y-2">
          <div
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground"
            style={{ viewTransitionName: 'page-badge' }}
          >
            <div className="p-1 rounded-md bg-primary/10">
              <BadgeIcon className="w-4 h-4 text-primary" />
            </div>
            <span>{config.badge}</span>
          </div>

          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
            style={{ viewTransitionName: 'page-title' }}
          >
            {config.title}
          </h1>
          <p
            className="text-lg text-muted-foreground max-w-2xl"
            style={{ viewTransitionName: 'page-description' }}
          >
            {config.description}
          </p>
        </div>
        {config.actions && (
          <div className="flex items-center gap-3 pb-1">{config.actions}</div>
        )}
      </div>
    </div>
  );
}
