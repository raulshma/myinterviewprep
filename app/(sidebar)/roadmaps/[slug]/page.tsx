import { notFound } from 'next/navigation';
import { getRoadmapWithProgress } from '@/lib/actions/roadmap';
import { getUserGamificationAction } from '@/lib/actions/gamification';
import { RoadmapPageClient } from './roadmap-page-client';

interface RoadmapPageProps {
  params: Promise<{ slug: string }>;
}

export default async function RoadmapPage({ params }: RoadmapPageProps) {
  const { slug } = await params;
  const [{ roadmap, progress, lessonAvailability }, gamification] = await Promise.all([
    getRoadmapWithProgress(slug),
    getUserGamificationAction(),
  ]);
  
  if (!roadmap) {
    notFound();
  }
  
  return (
    <RoadmapPageClient 
      initialRoadmap={roadmap} 
      initialProgress={progress} 
      initialLessonAvailability={lessonAvailability}
      initialGamification={gamification}
    />
  );
}

export async function generateMetadata({ params }: RoadmapPageProps) {
  const { slug } = await params;
  const { roadmap } = await getRoadmapWithProgress(slug);
  
  if (!roadmap) {
    return { title: 'Roadmap Not Found' };
  }
  
  return {
    title: `${roadmap.title} | Learning Roadmap`,
    description: roadmap.description,
  };
}
