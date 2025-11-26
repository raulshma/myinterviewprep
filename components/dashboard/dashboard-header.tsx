"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
  stats: {
    total: number;
    active: number;
    completed: number;
  };
}

const statCards = [
  {
    key: "total",
    label: "Total Interviews",
    icon: Briefcase,
    color: "text-foreground",
    bgColor: "bg-secondary",
  },
  {
    key: "active",
    label: "In Progress",
    icon: Clock,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    key: "completed",
    label: "Completed",
    icon: CheckCircle2,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
] as const;

export function DashboardHeader({ stats }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      {/* Title section */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <div className="inline-flex items-center gap-2 border border-primary/20 bg-primary/5 px-3 py-1.5 mb-3 text-xs text-foreground">
            <Briefcase className="w-3 h-3 text-primary" />
            <span>Dashboard</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-mono text-foreground mb-1">
            Your Interview Preps
          </h1>
          <p className="text-muted-foreground text-sm">
            {stats.active > 0
              ? `You have ${stats.active} interview${
                  stats.active > 1 ? "s" : ""
                } in progress`
              : "Create your first interview prep to get started"}
          </p>
        </div>
        <Link href="/dashboard/new">
          <Button className="group">
            <Plus className="w-4 h-4 mr-2" />
            New Interview
          </Button>
        </Link>
      </motion.div>

      {/* Stats cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.key}
            className="group bg-card border border-border p-5 hover:border-primary/30 transition-all duration-300"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-mono text-foreground">
                  {stats[stat.key]}
                </p>
              </div>
              <div
                className={`w-10 h-10 ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
