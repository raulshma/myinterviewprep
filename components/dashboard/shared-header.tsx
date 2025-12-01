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
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div
            className="inline-flex items-center gap-2 mb-2"
            style={{ viewTransitionName: 'page-badge' }}
          >
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/10 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10">
              <BadgeIcon className="w-3.5 h-3.5" />
              <span>{config.badge}</span>
            </div>
          </div>

          <h1
            className="text-2xl md:text-3xl font-bold tracking-tight text-foreground"
            style={{ viewTransitionName: 'page-title' }}
          >
            {config.title}
          </h1>
          <p
            className="text-base text-muted-foreground max-w-2xl"
            style={{ viewTransitionName: 'page-description' }}
          >
            {config.description}
          </p>
        </div>
        {config.actions && (
          <div className="flex items-center gap-2">{config.actions}</div>
        )}
      </div>
    </div>
  );
}
