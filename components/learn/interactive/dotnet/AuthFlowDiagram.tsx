"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  User,
  Server,
  Shield,
  Globe,
  Key,
  Lock,
  CheckCircle2,
  Play,
  RotateCcw,
  FileJson,
  Cookie,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AuthFlowDiagramProps {
  mode?: "beginner" | "intermediate" | "advanced";
  flowType?: "cookie" | "jwt-bearer" | "oauth-code";
}

type Actor = "browser" | "server" | "identity" | "api";

interface FlowStep {
  id: number;
  title: string;
  description: string;
  from: Actor;
  to: Actor;
  data?: string;
  icon?: React.ReactNode;
}

const actorInfo: Record<Actor, { name: string; icon: React.ReactNode; color: string }> = {
  browser: {
    name: "Browser/Client",
    icon: <Globe className="w-5 h-5" />,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  },
  server: {
    name: "Your Application",
    icon: <Server className="w-5 h-5" />,
    color: "bg-green-500/10 text-green-600 border-green-500/30",
  },
  identity: {
    name: "Identity Provider",
    icon: <Shield className="w-5 h-5" />,
    color: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  },
  api: {
    name: "Protected API",
    icon: <Lock className="w-5 h-5" />,
    color: "bg-orange-500/10 text-orange-600 border-orange-500/30",
  },
};

const cookieAuthFlow: FlowStep[] = [
  {
    id: 1,
    title: "User submits login form",
    description: "Username and password sent to your server over HTTPS",
    from: "browser",
    to: "server",
    data: "POST /login { email, password }",
    icon: <User className="w-4 h-4" />,
  },
  {
    id: 2,
    title: "Server validates credentials",
    description: "Checks password hash against database, creates ClaimsPrincipal",
    from: "server",
    to: "server",
    data: "SignInManager.PasswordSignInAsync()",
    icon: <Shield className="w-4 h-4" />,
  },
  {
    id: 3,
    title: "Authentication cookie issued",
    description: "Encrypted cookie containing identity claims sent to browser",
    from: "server",
    to: "browser",
    data: "Set-Cookie: .AspNetCore.Cookies=...; HttpOnly; Secure",
    icon: <Cookie className="w-4 h-4" />,
  },
  {
    id: 4,
    title: "Subsequent requests include cookie",
    description: "Browser automatically sends cookie with every request to the domain",
    from: "browser",
    to: "server",
    data: "Cookie: .AspNetCore.Cookies=...",
    icon: <Globe className="w-4 h-4" />,
  },
  {
    id: 5,
    title: "Server decrypts and validates",
    description: "Cookie middleware extracts ClaimsPrincipal, sets User property",
    from: "server",
    to: "server",
    data: "HttpContext.User = ClaimsPrincipal",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
];

const jwtBearerFlow: FlowStep[] = [
  {
    id: 1,
    title: "Client requests token",
    description: "Sends credentials to token endpoint (often /token or /login)",
    from: "browser",
    to: "server",
    data: "POST /api/auth/login { email, password }",
    icon: <Key className="w-4 h-4" />,
  },
  {
    id: 2,
    title: "Server validates & generates JWT",
    description: "Creates token with claims, signs with secret/private key",
    from: "server",
    to: "server",
    data: "new JwtSecurityToken(claims, expires, signingCredentials)",
    icon: <FileJson className="w-4 h-4" />,
  },
  {
    id: 3,
    title: "Token returned to client",
    description: "JWT (and optionally refresh token) sent in response body",
    from: "server",
    to: "browser",
    data: '{ "access_token": "eyJ...", "expires_in": 3600 }',
    icon: <Key className="w-4 h-4" />,
  },
  {
    id: 4,
    title: "Client stores token",
    description: "Typically in memory, localStorage, or secure storage",
    from: "browser",
    to: "browser",
    data: "localStorage.setItem('token', jwt)",
    icon: <Lock className="w-4 h-4" />,
  },
  {
    id: 5,
    title: "API request with Bearer token",
    description: "Token included in Authorization header for protected endpoints",
    from: "browser",
    to: "api",
    data: "Authorization: Bearer eyJhbGciOiJIUzI1NiIs...",
    icon: <Globe className="w-4 h-4" />,
  },
  {
    id: 6,
    title: "API validates token",
    description: "JwtBearer middleware verifies signature, expiration, claims",
    from: "api",
    to: "api",
    data: "TokenValidationParameters.ValidateLifetime = true",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
];

const oauthCodeFlow: FlowStep[] = [
  {
    id: 1,
    title: "User clicks 'Login with Provider'",
    description: "Redirected to authorization server (Google, Azure AD, etc.)",
    from: "browser",
    to: "identity",
    data: "/authorize?client_id=...&redirect_uri=...&scope=openid profile",
    icon: <Globe className="w-4 h-4" />,
  },
  {
    id: 2,
    title: "User authenticates with provider",
    description: "Enters credentials on provider's login page, grants consent",
    from: "identity",
    to: "identity",
    data: "User enters credentials & approves scopes",
    icon: <User className="w-4 h-4" />,
  },
  {
    id: 3,
    title: "Redirect back with authorization code",
    description: "Provider redirects to your callback URL with a code",
    from: "identity",
    to: "browser",
    data: "/callback?code=abc123&state=xyz789",
    icon: <Key className="w-4 h-4" />,
  },
  {
    id: 4,
    title: "Server exchanges code for tokens",
    description: "Backend calls token endpoint with code + client secret",
    from: "server",
    to: "identity",
    data: "POST /token { code, client_id, client_secret, redirect_uri }",
    icon: <Shield className="w-4 h-4" />,
  },
  {
    id: 5,
    title: "Tokens received",
    description: "Access token, ID token (OIDC), and optionally refresh token",
    from: "identity",
    to: "server",
    data: '{ access_token, id_token, refresh_token }',
    icon: <FileJson className="w-4 h-4" />,
  },
  {
    id: 6,
    title: "Session established",
    description: "Server creates session/cookie using claims from ID token",
    from: "server",
    to: "browser",
    data: "Set-Cookie: .AspNetCore.Cookies=...",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
];

export function AuthFlowDiagram({
  mode = "beginner",
  flowType = "cookie",
}: AuthFlowDiagramProps) {
  const [currentFlow, setCurrentFlow] = useState(flowType);
  const [stepIndex, setStepIndex] = useState(0);

  const flow = useMemo(() => {
    switch (currentFlow) {
      case "cookie":
        return cookieAuthFlow;
      case "jwt-bearer":
        return jwtBearerFlow;
      case "oauth-code":
        return oauthCodeFlow;
      default:
        return cookieAuthFlow;
    }
  }, [currentFlow]);

  const currentStep = flow[stepIndex];

  const handleNext = () => {
    if (stepIndex < flow.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  };

  const handleReset = () => {
    setStepIndex(0);
  };

  const handleFlowChange = (newFlow: typeof currentFlow) => {
    setCurrentFlow(newFlow);
    setStepIndex(0);
  };

  const flowOptions = [
    { id: "cookie", label: "Cookie Auth", icon: <Cookie className="w-4 h-4" /> },
    { id: "jwt-bearer", label: "JWT Bearer", icon: <Key className="w-4 h-4" /> },
    { id: "oauth-code", label: "OAuth/OIDC", icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto my-8 border rounded-xl overflow-hidden bg-card shadow-sm">
      {/* Header */}
      <div className="bg-muted/50 p-4 border-b">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Authentication Flow Diagram</h3>
              <p className="text-xs text-muted-foreground">
                Step {stepIndex + 1} of {flow.length}
              </p>
            </div>
          </div>

          {/* Flow Type Tabs */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {flowOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleFlowChange(option.id as typeof currentFlow)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  currentFlow === option.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Beginner Explanation */}
        {mode === "beginner" && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              {currentFlow === "cookie" && (
                <>🍪 <strong>Cookie authentication</strong> is like a wristband at a theme park — you prove who you are once at the entrance, get a wristband, and show it for every ride.</>
              )}
              {currentFlow === "jwt-bearer" && (
                <>🎫 <strong>JWT Bearer authentication</strong> is like carrying a VIP pass that contains your privileges — every venue can verify it independently without calling HQ.</>
              )}
              {currentFlow === "oauth-code" && (
                <>🔑 <strong>OAuth/OIDC</strong> is like using your Google account to log into other apps — you trust Google to verify who you are, and apps trust Google&apos;s confirmation.</>
              )}
            </p>
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {flow.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <motion.button
                onClick={() => setStepIndex(i)}
                className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                  i === stepIndex
                    ? "bg-primary text-primary-foreground border-primary"
                    : i < stepIndex
                      ? "bg-green-500/10 text-green-600 border-green-500"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {i < stepIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </motion.button>
              {i < flow.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {/* Current Step Visualization */}
        <AnimatePresence mode="wait">
          {currentStep && (
            <motion.div
              key={`${currentFlow}-${currentStep.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Step Card */}
              <div className="bg-muted/30 rounded-xl p-6 border">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    {currentStep.icon || <Shield className="w-6 h-6 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-1">{currentStep.title}</h4>
                    <p className="text-sm text-muted-foreground">{currentStep.description}</p>
                  </div>
                </div>

                {/* Flow Arrow Visualization */}
                <div className="flex items-center justify-center gap-6 py-6">
                  <motion.div
                    className={`px-4 py-3 rounded-lg border flex items-center gap-2 ${actorInfo[currentStep.from].color}`}
                    initial={{ x: -20 }}
                    animate={{ x: 0 }}
                  >
                    {actorInfo[currentStep.from].icon}
                    <span className="text-sm font-medium">{actorInfo[currentStep.from].name}</span>
                  </motion.div>

                  <motion.div
                    className="flex-1 max-w-[200px] relative"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                  >
                    <div className="h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50 w-full" />
                    <motion.div
                      className="absolute top-1/2 left-0 -translate-y-1/2"
                      animate={{ x: ["0%", "calc(100% - 24px)", "0%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowRight className="w-6 h-6 text-primary" />
                    </motion.div>
                  </motion.div>

                  <motion.div
                    className={`px-4 py-3 rounded-lg border flex items-center gap-2 ${actorInfo[currentStep.to].color}`}
                    initial={{ x: 20 }}
                    animate={{ x: 0 }}
                  >
                    {actorInfo[currentStep.to].icon}
                    <span className="text-sm font-medium">{actorInfo[currentStep.to].name}</span>
                  </motion.div>
                </div>

                {/* Data Display */}
                {currentStep.data && (
                  <div className="bg-background rounded-lg border p-3">
                    <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                      <FileJson className="w-3 h-3" />
                      Data in this step:
                    </div>
                    <code className="text-xs font-mono text-foreground break-all">
                      {currentStep.data}
                    </code>
                  </div>
                )}
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
            disabled={stepIndex >= flow.length - 1}
            className="gap-2"
          >
            <Play className="w-4 h-4" />
            {stepIndex >= flow.length - 1 ? "Complete!" : "Next Step"}
          </Button>
        </div>

        {/* Advanced Security Notes */}
        {mode === "advanced" && (
          <div className="p-4 bg-muted/30 rounded-lg border mt-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Considerations
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              {currentFlow === "cookie" && (
                <>
                  <li>Always use HttpOnly and Secure flags on authentication cookies</li>
                  <li>Implement CSRF protection with anti-forgery tokens</li>
                  <li>Consider SameSite=Strict or Lax cookie attribute</li>
                </>
              )}
              {currentFlow === "jwt-bearer" && (
                <>
                  <li>Never expose your signing key; use asymmetric keys for distributed systems</li>
                  <li>Validate audience, issuer, and lifetime on every request</li>
                  <li>Implement token refresh before expiration to avoid re-login</li>
                </>
              )}
              {currentFlow === "oauth-code" && (
                <>
                  <li>Always use PKCE for public clients (SPAs, mobile apps)</li>
                  <li>Validate the state parameter to prevent CSRF attacks</li>
                  <li>Exchange authorization code server-side to protect client secret</li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
