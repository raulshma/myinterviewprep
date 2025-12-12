'use client';

import { useEffect } from 'react';
import { useSharedHeader } from '@/components/dashboard/shared-header-context';
import { RoadmapClient } from './roadmap-client';
import type { Roadmap } from '@/lib/db/schemas/roadmap';
import type { UserRoadmapProgress } from '@/lib/db/schemas/user-roadmap-progress';
import type { ObjectiveLessonInfo } from '@/lib/actions/lessons';
import type { UserGamification } from '@/lib/db/schemas/user';

interface RoadmapPageClientProps {
  initialRoadmap: Roadmap;
  initialProgress: UserRoadmapProgress | null;
  initialLessonAvailability: Record<string, ObjectiveLessonInfo[]>;
  initialGamification: UserGamification | null;
}

export function RoadmapPageClient({ 
  initialRoadmap, 
  initialProgress, 
  initialLessonAvailability,
  initialGamification,
}: RoadmapPageClientProps) {
  const { hideHeader } = useSharedHeader();

  useEffect(() => {
    hideHeader();
  }, [hideHeader]);

  return (
    <div className="h-[calc(100vh-4rem)]">
      <RoadmapClient 
        initialRoadmap={initialRoadmap} 
        initialProgress={initialProgress} 
        initialLessonAvailability={initialLessonAvailability}
        initialGamification={initialGamification}
      />
    </div>
  );
}