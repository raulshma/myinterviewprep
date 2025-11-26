"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Shield, Sparkles } from "lucide-react";

export function AdminHeader() {
  return (
    <header className="border-b border-border px-6 py-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <div className="inline-flex items-center gap-2 border border-primary/20 bg-primary/5 px-3 py-1.5 mb-3 text-xs text-foreground">
            <Shield className="w-3 h-3 text-primary" />
            <span>Admin</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-mono text-foreground mb-1">
            System Dashboard
          </h1>

          <p className="text-muted-foreground text-sm">
            Monitor platform health, manage users, and configure AI systems
          </p>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-600 dark:text-green-400 font-mono">
              Systems Online
            </span>
          </div>
          <Badge variant="outline" className="px-3 py-1.5 font-mono text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        </div>
      </motion.div>
    </header>
  );
}
