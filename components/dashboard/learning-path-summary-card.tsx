"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, Brain, ArrowRight, Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface LearningPathSummaryCardProps {
  learningPath: {
    _id: string;
    goal: string;
    overallElo: number;
    skillScores: Record<string, number>;
    timeline: { success: boolean }[];
  };
}

export function LearningPathSummaryCard({ learningPath }: LearningPathSummaryCardProps) {
  const successCount = learningPath.timeline.filter((e) => e.success).length;
  const totalCount = learningPath.timeline.length;
  const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;
  const mastery = Math.min(100, Math.round(learningPath.overallElo / 20));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-6 hover:shadow-lg transition-all duration-300 group h-full flex flex-col justify-between"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-500">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Active Focus</h3>
                <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{learningPath.goal}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
             <div className="space-y-1 p-2 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">ELO</span>
                </div>
                <span className="font-mono font-bold text-lg block">{Math.round(learningPath.overallElo)}</span>
             </div>
             
             <div className="space-y-1 p-2 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <Target className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">Acts</span>
                </div>
                <span className="font-mono font-bold text-lg block">{totalCount}</span>
             </div>

             <div className="space-y-1 p-2 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <Trophy className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">Win %</span>
                </div>
                <span className="font-mono font-bold text-lg block">{successRate}%</span>
             </div>
          </div>
      </div>

      <div className="relative z-10 flex flex-col gap-4 mt-6">
           <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Mastery Progress</span>
                <span className="text-foreground">{mastery}%</span> 
              </div>
              <Progress value={mastery} className="h-2" />
           </div>
           
           <Button asChild className="w-full justify-between shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all group/btn">
            <Link href={`/learning/${learningPath._id}`}>
              Continue Learning
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </Button>
      </div>
    </motion.div>
  );
}
