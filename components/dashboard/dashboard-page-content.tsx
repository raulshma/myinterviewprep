'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase } from 'lucide-react';
import { useSharedHeader } from './shared-header-context';
import { DashboardContent } from './dashboard-content';
import { ViewTransitionLink } from '@/components/transitions/view-transition-link';
import { DashboardHero } from './dashboard-hero';
import { StatsBentoGrid } from './stats-bento-grid';
import type { DashboardInterviewData } from '@/lib/actions/dashboard';

interface DashboardPageContentProps {
  interviews: DashboardInterviewData[];
  stats: {
    total: number;
    active: number;
    completed: number;
  };
}

export function DashboardPageContent({ interviews, stats }: DashboardPageContentProps) {
  const { setHeader } = useSharedHeader();

  useEffect(() => {
    setHeader({
      badge: 'Dashboard',
      badgeIcon: Briefcase,
      title: 'Your Interview Preps',
      description: stats.active > 0
        ? `You have ${stats.active} interview${stats.active > 1 ? 's' : ''} in progress`
        : 'Create your first interview prep to get started',
      actions: (
        <ViewTransitionLink href="/dashboard/new">
          <Button className="group rounded-full px-6">
            <Plus className="w-4 h-4 mr-2" />
            New Interview
          </Button>
        </ViewTransitionLink>
      ),
    });
  }, [stats.active, setHeader]);

  return (
    <div className="max-w-7xl mx-auto">
      <DashboardHero />
      <StatsBentoGrid stats={stats} />
      <DashboardContent interviews={interviews} />
    </div>
  );
}
