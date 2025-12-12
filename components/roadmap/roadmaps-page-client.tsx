'use client';

import { useEffect, type ReactNode } from 'react';
import { Map } from 'lucide-react';
import { useSharedHeader } from '@/components/dashboard/shared-header-context';

interface RoadmapsPageClientProps {
  children: ReactNode;
}

export function RoadmapsPageClient({ children }: RoadmapsPageClientProps) {
  const { setHeader } = useSharedHeader();

  useEffect(() => {
    setHeader({
      badge: 'Learning Roadmaps',
      badgeIcon: Map,
      title: 'Visual Learning Paths',
      description: 'Follow structured, interactive roadmaps to master new skills. Each roadmap contains topics with learning objectives, resources, and progress tracking.'
    });
  }, [setHeader]);

  return <>{children}</>;
}