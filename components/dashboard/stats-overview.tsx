"use client";

import { motion } from "framer-motion";
import { Briefcase, CheckCircle2, Clock } from "lucide-react";

interface StatsOverviewProps {
  total: number;
  active: number;
  completed: number;
}

export function StatsOverview({ total, active, completed }: StatsOverviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-6 hover:shadow-lg transition-all duration-300 group h-full flex flex-col justify-between"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Briefcase className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-lg">Snapshot</h2>
        </div>

        <div className="space-y-6">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-md text-muted-foreground">
                        <Briefcase className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Total Interviews</span>
                </div>
                <span className="text-xl font-bold font-mono">{total}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
                <div className="flex items-center gap-3">
                     <div className="p-2 bg-blue-500/10 rounded-md text-blue-500">
                        <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Active</span>
                </div>
                <span className="text-xl font-bold font-mono text-blue-500">{active}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 hover:bg-green-500/10 transition-colors">
                <div className="flex items-center gap-3">
                     <div className="p-2 bg-green-500/10 rounded-md text-green-500">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Completed</span>
                </div>
                <span className="text-xl font-bold font-mono text-green-500">{completed}</span>
            </div>
        </div>
      </div>
    </motion.div>
  );
}
