'use client';

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Settings, Sparkles } from "lucide-react";

interface SettingsHeaderProps {
  profile: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    imageUrl: string | null;
    plan: string;
  };
}

export function SettingsHeader({ profile }: SettingsHeaderProps) {
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "User";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative mb-8"
    >
      {/* Section badge */}
      <div className="inline-flex items-center gap-2 border border-primary/20 bg-primary/5 px-3 py-1.5 mb-3 text-xs text-foreground">
        <Settings className="w-3 h-3 text-primary" />
        <span>Settings</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {profile.imageUrl ? (
            <div className="relative">
              <img
                src={profile.imageUrl}
                alt={fullName}
                className="w-12 h-12 border border-border object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
            </div>
          ) : (
            <div className="w-12 h-12 bg-secondary flex items-center justify-center border border-border">
              <span className="text-lg font-mono text-foreground">
                {fullName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div>
            <h1 className="text-2xl md:text-3xl font-mono text-foreground mb-1">
              {fullName}
            </h1>
            <p className="text-muted-foreground text-sm">{profile.email}</p>
          </div>
        </div>

        <Badge 
          variant={profile.plan === "MAX" ? "default" : "secondary"}
          className="text-sm px-4 py-1.5 flex items-center gap-2 w-fit"
        >
          {profile.plan === "MAX" && <Sparkles className="w-3 h-3" />}
          {profile.plan} Plan
        </Badge>
      </div>
    </motion.div>
  );
}
