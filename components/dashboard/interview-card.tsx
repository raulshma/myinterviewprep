'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  MoreHorizontal,
  Trash2,
  Share2,
  Copy,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveDropdown,
  ResponsiveDropdownItem,
  ResponsiveDropdownSeparator,
} from '@/components/ui/responsive-dropdown';
import { ViewTransitionLink } from '@/components/transitions/view-transition-link';
import type { DashboardInterviewData } from '@/lib/actions/dashboard';
import Link from 'next/link';

interface InterviewCardNewProps {
  interview: DashboardInterviewData;
  onDelete: () => void;
  isDeleting?: boolean;
}

const statusConfig = {
  upcoming: {
    label: 'New',
    icon: Sparkles,
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  active: {
    label: 'In Progress',
    icon: Clock,
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
};

export function InterviewCardNew({
  interview,
  onDelete,
  isDeleting,
}: InterviewCardNewProps) {
  const status = statusConfig[interview.status];
  const StatusIcon = status.icon;

  const formattedDate = new Date(interview.createdAt).toLocaleDateString(
    'en-US',
    {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }
  );

  return (
    <ViewTransitionLink
      href={`/interview/${interview._id}`}
      viewTransitionName={`interview-card-${interview._id}`}
    >
      <div
        className="group relative flex flex-col bg-card/50 backdrop-blur-md rounded-3xl border border-white/10 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:translate-y-[-4px] transition-all duration-500 overflow-hidden w-full"
      >
        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="p-6 flex flex-col relative h-full">
            {/* Top Row: Icon & Status */}
            <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/10 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-500 shrink-0">
                    <Briefcase className="w-5 h-5 text-foreground/80" />
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                    <Badge
                        variant="secondary"
                        className={`rounded-full px-3 py-1 text-xs font-medium border-0 ${status.className}`}
                    >
                        <StatusIcon className="w-3 pb-0.5 h-3 mr-1.5 inline-block" />
                        {status.label}
                    </Badge>
                     
                     {/* More Actions Dropdown */}
                    <div onClick={(e) => e.stopPropagation()}>
                        <ResponsiveDropdown
                            title="Actions"
                            trigger={
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                            >
                                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                            </Button>
                            }
                        >
                            <ResponsiveDropdownItem icon={<Copy className="w-4 h-4" />}>
                            Duplicate
                            </ResponsiveDropdownItem>
                            <ResponsiveDropdownItem icon={<Share2 className="w-4 h-4" />}>
                            Share
                            </ResponsiveDropdownItem>
                            <ResponsiveDropdownSeparator />
                            <ResponsiveDropdownItem
                            variant="destructive"
                            disabled={isDeleting}
                            icon={<Trash2 className="w-4 h-4" />}
                            onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            >
                            Delete
                            </ResponsiveDropdownItem>
                        </ResponsiveDropdown>
                    </div>
                </div>
            </div>

            {/* Title & Info */}
            <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors duration-300">
                    {interview.jobDetails.title}
                </h3>
                <p className="text-sm text-muted-foreground font-medium">
                     {[interview.jobDetails.company, interview.jobDetails.programmingLanguage]
                        .filter(Boolean)
                        .join(' • ')}
                </p>
            </div>
            
            {/* Tags - Show ALL topics */}
            <div className="flex flex-wrap gap-2 mb-8">
                 {interview.topics.map((topic) => (
                    <span
                        key={topic}
                        className="px-2.5 py-1 rounded-md bg-secondary/50 text-xs font-medium text-secondary-foreground/80"
                    >
                        {topic}
                    </span>
                 ))}
                 {interview.topics.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">No topics</span>
                 )}
            </div>

            {/* Progress Bar & Footer Area */}
            <div className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-foreground">{interview.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${interview.progress}%` }}
                        />
                    </div>
                </div>

                {/* Footer Info */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {formattedDate}
                    </span>
                    
                    <div className="w-8 h-8 rounded-full bg-background/50 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        <ArrowUpRight className="w-4 h-4 text-primary" />
                    </div>
                </div>
            </div>

        </div>

      </div>
    </ViewTransitionLink>
  );
}
