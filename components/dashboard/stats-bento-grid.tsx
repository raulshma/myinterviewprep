"use client";

import { motion } from "framer-motion";
import { Briefcase, CheckCircle2, Clock, BookOpen, ArrowRight, Plus, Target, Brain } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { LearningPath } from "@/lib/db/schemas/learning-path";

interface StatsBentoGridProps {
  stats: {
    total: number;
    active: number;
    completed: number;
  };
  learningPath: LearningPath | null;
}

export function StatsBentoGrid({ stats, learningPath }: StatsBentoGridProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as any },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {/* Learning Path - Large Card (2x2 on desktop) */}
      <motion.div
        variants={item}
        className="md:col-span-2 lg:col-span-2 row-span-2 relative overflow-hidden rounded-xl bg-card border border-border p-6 flex flex-col"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-lg">Current Focus</h3>
          </div>
          {learningPath && (
            <Link href={`/learning/${learningPath._id}`} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              View Path <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {learningPath ? (
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h4 className="text-2xl font-bold mb-2 line-clamp-2">{learningPath.goal}</h4>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <Brain className="w-4 h-4" />
                  <span>ELO {Math.round(learningPath.overallElo)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  <span>{learningPath.timeline.length} Activities</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-mono font-medium">{Math.round((learningPath.timeline.filter(e => e.success).length / (learningPath.timeline.length || 1)) * 100)}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((learningPath.timeline.filter(e => e.success).length / (learningPath.timeline.length || 1)) * 100)}%` }}
                />
              </div>
              <Button asChild className="w-full mt-4" variant="outline">
                <Link href={`/learning/${learningPath._id}`}>Continue Learning</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <h4 className="font-medium mb-2">No Active Path</h4>
            <p className="text-sm text-muted-foreground mb-4">Start a personalized learning journey.</p>
            <Button asChild size="sm">
              <Link href="/learning/new">Create Path</Link>
            </Button>
          </div>
        )}
      </motion.div>

      {/* Active Interviews */}
      <motion.div
        variants={item}
        className="md:col-span-1 lg:col-span-1 relative overflow-hidden rounded-xl bg-card border border-border p-6 flex flex-col justify-between group hover:border-blue-500/50 transition-colors"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active</span>
        </div>
        <div>
          <div className="text-4xl font-bold mb-1">{stats.active}</div>
          <p className="text-sm text-muted-foreground">In Progress</p>
        </div>
      </motion.div>

      {/* Completed */}
      <motion.div
        variants={item}
        className="md:col-span-1 lg:col-span-1 relative overflow-hidden rounded-xl bg-card border border-border p-6 flex flex-col justify-between group hover:border-green-500/50 transition-colors"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Done</span>
        </div>
        <div>
          <div className="text-4xl font-bold mb-1">{stats.completed}</div>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>
      </motion.div>

      {/* Total Stats - Wide on mobile, single on desktop */}
      <motion.div
        variants={item}
        className="md:col-span-2 lg:col-span-2 relative overflow-hidden rounded-xl bg-secondary/30 border border-border p-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-background rounded-xl border border-border">
            <Briefcase className="w-6 h-6 text-foreground" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Interviews</p>
          </div>
        </div>
        <div className="h-full w-px bg-border mx-4 hidden sm:block" />
        <div className="hidden sm:flex items-center gap-8">
           <div className="text-right">
             <div className="text-sm font-medium text-foreground">Success Rate</div>
             <div className="text-xs text-muted-foreground">Based on completed</div>
           </div>
           <div className="text-2xl font-bold text-foreground">
             {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
