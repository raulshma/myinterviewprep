"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserCheck,
  Key,
  Shield,
  Database,
  ArrowRight,
  Play,
  RotateCcw,
  CheckCircle2,
  Lock,
  UserPlus,
  LogIn,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface IdentityArchitectureVisualizerProps {
  mode?: "beginner" | "intermediate" | "advanced";
  scenario?: "registration" | "login" | "role-management" | "overview";
}

type IdentityComponent = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
};

type FlowStep = {
  id: string;
  title: string;
  description: string;
  from: string;
  to: string;
  data?: string;
};

const identityComponents: IdentityComponent[] = [
  {
    id: "user",
    name: "User",
    description: "The person trying to access the application",
    icon: <Users className="w-5 h-5" />,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  },
  {
    id: "usermanager",
    name: "UserManager",
    description: "Manages user creation, passwords, and account operations",
    icon: <UserCheck className="w-5 h-5" />,
    color: "bg-green-500/10 text-green-500 border-green-500/30",
  },
  {
    id: "signinmanager",
    name: "SignInManager",
    description: "Handles authentication: login, logout, 2FA",
    icon: <LogIn className="w-5 h-5" />,
    color: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  },
  {
    id: "rolemanager",
    name: "RoleManager",
    description: "Manages roles for role-based authorization",
    icon: <Shield className="w-5 h-5" />,
    color: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  },
  {
    id: "store",
    name: "Identity Store",
    description: "Database tables: AspNetUsers, AspNetRoles, AspNetUserClaims",
    icon: <Database className="w-5 h-5" />,
    color: "bg-slate-500/10 text-slate-500 border-slate-500/30",
  },
];

const registrationFlow: FlowStep[] = [
  {
    id: "step1",
    title: "User submits registration form",
    description: "Email, password, and profile info sent to your app",
    from: "user",
    to: "usermanager",
    data: "{ email, password }",
  },
  {
    id: "step2",
    title: "UserManager validates & hashes password",
    description: "Password is securely hashed using PBKDF2 (never stored plain!)",
    from: "usermanager",
    to: "usermanager",
    data: "Hash(password + salt)",
  },
  {
    id: "step3",
    title: "User record created in database",
    description: "New row in AspNetUsers table with hashed password",
    from: "usermanager",
    to: "store",
    data: "INSERT INTO AspNetUsers",
  },
  {
    id: "step4",
    title: "Registration complete!",
    description: "User can now log in with their credentials",
    from: "store",
    to: "user",
    data: "Success ✓",
  },
];

const loginFlow: FlowStep[] = [
  {
    id: "step1",
    title: "User enters credentials",
    description: "Email and password submitted to the login endpoint",
    from: "user",
    to: "signinmanager",
    data: "{ email, password }",
  },
  {
    id: "step2",
    title: "SignInManager finds user",
    description: "Looks up user by email in the Identity store",
    from: "signinmanager",
    to: "store",
    data: "SELECT FROM AspNetUsers",
  },
  {
    id: "step3",
    title: "Password verification",
    description: "Hashes input and compares with stored hash",
    from: "signinmanager",
    to: "signinmanager",
    data: "Compare hashes",
  },
  {
    id: "step4",
    title: "Authentication cookie issued",
    description: "Encrypted cookie contains user identity claims",
    from: "signinmanager",
    to: "user",
    data: "Set-Cookie: .AspNetCore.Identity",
  },
];

const roleFlow: FlowStep[] = [
  {
    id: "step1",
    title: "Admin creates a role",
    description: 'Using RoleManager to create "Admin" or "Editor" roles',
    from: "user",
    to: "rolemanager",
    data: 'CreateAsync("Admin")',
  },
  {
    id: "step2",
    title: "Role saved to database",
    description: "New entry in AspNetRoles table",
    from: "rolemanager",
    to: "store",
    data: "INSERT INTO AspNetRoles",
  },
  {
    id: "step3",
    title: "Assign user to role",
    description: "UserManager adds user-role relationship",
    from: "usermanager",
    to: "store",
    data: "INSERT INTO AspNetUserRoles",
  },
  {
    id: "step4",
    title: "Role claim added at login",
    description: 'User\'s ClaimsPrincipal includes role claims',
    from: "signinmanager",
    to: "user",
    data: 'Claim: role = "Admin"',
  },
];

export function IdentityArchitectureVisualizer({
  mode = "beginner",
  scenario = "overview",
}: IdentityArchitectureVisualizerProps) {
  const [currentScenario, setCurrentScenario] = useState(scenario);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentFlow = useMemo(() => {
    switch (currentScenario) {
      case "registration":
        return registrationFlow;
      case "login":
        return loginFlow;
      case "role-management":
        return roleFlow;
      default:
        return [];
    }
  }, [currentScenario]);

  const currentStep = currentFlow[stepIndex];

  const handleNext = () => {
    if (stepIndex < currentFlow.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  };

  const handleReset = () => {
    setStepIndex(0);
    setIsPlaying(false);
  };

  const handleScenarioChange = (newScenario: typeof currentScenario) => {
    setCurrentScenario(newScenario);
    setStepIndex(0);
    setIsPlaying(false);
  };

  const scenarios = [
    { id: "overview", label: "Overview", icon: <Settings className="w-4 h-4" /> },
    { id: "registration", label: "Registration", icon: <UserPlus className="w-4 h-4" /> },
    { id: "login", label: "Login", icon: <LogIn className="w-4 h-4" /> },
    { id: "role-management", label: "Roles", icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto my-8 border rounded-xl overflow-hidden bg-card shadow-sm">
      {/* Header */}
      <div className="bg-muted/50 p-4 border-b">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">ASP.NET Core Identity Architecture</h3>
              <p className="text-xs text-muted-foreground">
                {mode === "beginner" && "Visual guide to user management"}
                {mode === "intermediate" && "Service interactions & data flow"}
                {mode === "advanced" && "Deep dive into Identity internals"}
              </p>
            </div>
          </div>

          {/* Scenario Tabs */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => handleScenarioChange(s.id as typeof currentScenario)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  currentScenario === s.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Overview Mode */}
        {currentScenario === "overview" && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              ASP.NET Core Identity is like a <strong>hotel&apos;s front desk system</strong> — it manages
              guest registration, room keys (authentication), and access levels (authorization).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {identityComponents.slice(1).map((component) => (
                <motion.div
                  key={component.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border ${component.color}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {component.icon}
                    <span className="font-semibold text-sm">{component.name}</span>
                  </div>
                  <p className="text-xs opacity-80">{component.description}</p>
                </motion.div>
              ))}
            </div>

            {mode !== "beginner" && (
              <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Identity Database Schema
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
                  {[
                    "AspNetUsers",
                    "AspNetRoles",
                    "AspNetUserRoles",
                    "AspNetUserClaims",
                    "AspNetUserLogins",
                    "AspNetUserTokens",
                    "AspNetRoleClaims",
                  ].map((table) => (
                    <div key={table} className="px-2 py-1 bg-background rounded border">
                      {table}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Flow Visualization */}
        {currentScenario !== "overview" && (
          <div className="space-y-6">
            {/* Progress Indicators */}
            <div className="flex items-center justify-center gap-2">
              {currentFlow.map((step, i) => (
                <div key={step.id} className="flex items-center gap-2">
                  <motion.div
                    className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                      i === stepIndex
                        ? "bg-primary text-primary-foreground border-primary"
                        : i < stepIndex
                          ? "bg-green-500/10 text-green-600 border-green-500"
                          : "bg-muted text-muted-foreground border-border"
                    }`}
                    animate={i === stepIndex ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {i < stepIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </motion.div>
                  {i < currentFlow.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>

            {/* Current Step Details */}
            <AnimatePresence mode="wait">
              {currentStep && (
                <motion.div
                  key={currentStep.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-muted/30 rounded-xl p-6 border"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      {currentScenario === "registration" && <UserPlus className="w-6 h-6 text-primary" />}
                      {currentScenario === "login" && <LogIn className="w-6 h-6 text-primary" />}
                      {currentScenario === "role-management" && <Shield className="w-6 h-6 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">{currentStep.title}</h4>
                      <p className="text-sm text-muted-foreground mb-4">{currentStep.description}</p>
                      
                      {currentStep.data && (
                        <div className="inline-flex items-center gap-2 px-3 py-2 bg-background rounded-lg border font-mono text-xs">
                          <Lock className="w-3 h-3 text-muted-foreground" />
                          {currentStep.data}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visual Flow Arrow */}
                  <div className="mt-6 flex items-center justify-center gap-4">
                    <div className={`px-4 py-2 rounded-lg border ${
                      identityComponents.find(c => c.id === currentStep.from)?.color || "bg-muted"
                    }`}>
                      <span className="text-sm font-medium">
                        {identityComponents.find(c => c.id === currentStep.from)?.name || currentStep.from}
                      </span>
                    </div>
                    <motion.div
                      animate={{ x: [0, 10, 0] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      <ArrowRight className="w-6 h-6 text-primary" />
                    </motion.div>
                    <div className={`px-4 py-2 rounded-lg border ${
                      identityComponents.find(c => c.id === currentStep.to)?.color || "bg-muted"
                    }`}>
                      <span className="text-sm font-medium">
                        {identityComponents.find(c => c.id === currentStep.to)?.name || currentStep.to}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleNext}
                disabled={stepIndex >= currentFlow.length - 1}
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                {stepIndex >= currentFlow.length - 1 ? "Complete!" : "Next Step"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
