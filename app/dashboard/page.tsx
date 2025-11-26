import { Suspense } from "react";
import { getAuthUserId } from "@/lib/auth/get-user";
import { userRepository } from "@/lib/db/repositories/user-repository";
import { interviewRepository } from "@/lib/db/repositories/interview-repository";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import type { Interview } from "@/lib/db/schemas/interview";

export interface InterviewWithMeta extends Interview {
  status: "upcoming" | "active" | "completed";
  progress: number;
  topics: string[];
}

function getInterviewStatus(
  interview: Interview
): "upcoming" | "active" | "completed" {
  const hasOpeningBrief = !!interview.modules.openingBrief;
  const hasTopics = interview.modules.revisionTopics.length > 0;
  const hasMcqs = interview.modules.mcqs.length > 0;
  const hasRapidFire = interview.modules.rapidFire.length > 0;

  const moduleCount = [
    hasOpeningBrief,
    hasTopics,
    hasMcqs,
    hasRapidFire,
  ].filter(Boolean).length;

  if (moduleCount === 4) return "completed";
  if (moduleCount > 0) return "active";
  return "upcoming";
}

function getInterviewProgress(interview: Interview): number {
  const hasOpeningBrief = !!interview.modules.openingBrief;
  const hasTopics = interview.modules.revisionTopics.length > 0;
  const hasMcqs = interview.modules.mcqs.length > 0;
  const hasRapidFire = interview.modules.rapidFire.length > 0;

  const moduleCount = [
    hasOpeningBrief,
    hasTopics,
    hasMcqs,
    hasRapidFire,
  ].filter(Boolean).length;
  return Math.round((moduleCount / 4) * 100);
}

function extractTopics(interview: Interview): string[] {
  const topics: string[] = [];

  interview.modules.revisionTopics.slice(0, 4).forEach((topic) => {
    topics.push(topic.title);
  });

  if (topics.length === 0 && interview.modules.openingBrief?.keySkills) {
    topics.push(...interview.modules.openingBrief.keySkills.slice(0, 4));
  }

  return topics;
}

async function getDashboardData() {
  const clerkId = await getAuthUserId();
  const user = await userRepository.findByClerkId(clerkId);

  if (!user) {
    throw new Error("User not found");
  }

  const interviews = await interviewRepository.findByUserId(user._id);

  const interviewsWithMeta: InterviewWithMeta[] = interviews.map(
    (interview) => ({
      ...interview,
      status: getInterviewStatus(interview),
      progress: getInterviewProgress(interview),
      topics: extractTopics(interview),
    })
  );

  const stats = {
    total: interviews.length,
    active: interviewsWithMeta.filter(
      (i) => i.status === "active" || i.status === "upcoming"
    ).length,
    completed: interviewsWithMeta.filter((i) => i.status === "completed")
      .length,
  };

  return { interviews: interviewsWithMeta, stats };
}

export default async function DashboardPage() {
  return (
    <main className="flex-1 relative overflow-hidden">
      {/* Background effects matching landing page */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-50" />

      {/* Floating gradient orbs */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardDataLoader />
        </Suspense>
      </div>
    </main>
  );
}

async function DashboardDataLoader() {
  const { interviews, stats } = await getDashboardData();

  return (
    <>
      <DashboardHeader stats={stats} />
      <DashboardContent interviews={interviews} />
    </>
  );
}
