import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { interviewRepository } from "@/lib/db/repositories/interview-repository";
import { userRepository } from "@/lib/db/repositories/user-repository";
import { feedbackRepository } from "@/lib/db/repositories/feedback-repository";
import { ImprovementWorkspace } from "@/components/interview/improvement-workspace";

interface ImprovementPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ skill?: string }>;
}

export default async function ImprovementPage({
  params,
  searchParams,
}: ImprovementPageProps) {
  const { id } = await params;
  const { skill } = await searchParams;

  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/login");
  }

  const user = await userRepository.findByClerkId(clerkId);
  if (!user) {
    redirect("/onboarding");
  }

  // Verify interview exists and user owns it
  const interview = await interviewRepository.findById(id);
  if (!interview) {
    notFound();
  }

  if (interview.userId !== user._id && !interview.isPublic) {
    notFound();
  }

  // Get user's weakness analysis
  const analysis = await feedbackRepository.getAnalysisByUserId(user._id);

  // Get improvement plan if exists
  const improvementPlan = await feedbackRepository.getImprovementPlanByUserId(
    user._id
  );

  return (
    <ImprovementWorkspace
      interviewId={id}
      interview={interview}
      analysis={analysis}
      improvementPlan={improvementPlan}
      initialSkillCluster={skill}
      userLevel={5} // Default user level, could be calculated from ELO
      programmingLanguage={interview.jobDetails.programmingLanguage}
    />
  );
}
