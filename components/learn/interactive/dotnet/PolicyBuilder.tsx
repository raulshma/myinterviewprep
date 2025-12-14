"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  User,
  Key,
  Lock,
  Users,
  FileText,
  Settings,
  Play,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PolicyBuilderProps {
  mode?: "beginner" | "intermediate" | "advanced";
}

type RequirementType = "role" | "claim" | "age" | "custom";

interface Requirement {
  id: string;
  type: RequirementType;
  name: string;
  value: string;
  description: string;
}

interface TestUser {
  name: string;
  roles: string[];
  claims: Record<string, string>;
  age: number;
}

const availableRequirements: Requirement[] = [
  {
    id: "admin-role",
    type: "role",
    name: "Admin Role",
    value: "Admin",
    description: 'User must have "Admin" role',
  },
  {
    id: "manager-role",
    type: "role",
    name: "Manager Role",
    value: "Manager",
    description: 'User must have "Manager" role',
  },
  {
    id: "editor-role",
    type: "role",
    name: "Editor Role",
    value: "Editor",
    description: 'User must have "Editor" role',
  },
  {
    id: "dept-claim",
    type: "claim",
    name: "Department Claim",
    value: "Engineering",
    description: 'User must have department = "Engineering"',
  },
  {
    id: "country-claim",
    type: "claim",
    name: "Country Claim",
    value: "US",
    description: 'User must be in country = "US"',
  },
  {
    id: "age-21",
    type: "age",
    name: "Minimum Age 21",
    value: "21",
    description: "User must be at least 21 years old",
  },
  {
    id: "age-18",
    type: "age",
    name: "Minimum Age 18",
    value: "18",
    description: "User must be at least 18 years old",
  },
  {
    id: "verified-email",
    type: "claim",
    name: "Verified Email",
    value: "true",
    description: "User must have a verified email address",
  },
];

const testUsers: TestUser[] = [
  {
    name: "Alice (Admin)",
    roles: ["Admin", "Editor"],
    claims: { department: "Engineering", country: "US", email_verified: "true" },
    age: 32,
  },
  {
    name: "Bob (Editor)",
    roles: ["Editor"],
    claims: { department: "Marketing", country: "UK", email_verified: "true" },
    age: 25,
  },
  {
    name: "Charlie (User)",
    roles: [],
    claims: { department: "Engineering", country: "US", email_verified: "false" },
    age: 17,
  },
  {
    name: "Diana (Manager)",
    roles: ["Manager"],
    claims: { department: "Engineering", country: "CA", email_verified: "true" },
    age: 45,
  },
];

function RequirementBadge({ requirement, onRemove }: { requirement: Requirement; onRemove?: () => void }) {
  const typeColors: Record<RequirementType, string> = {
    role: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    claim: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    age: "bg-orange-500/10 text-orange-600 border-orange-500/30",
    custom: "bg-green-500/10 text-green-600 border-green-500/30",
  };

  const typeIcons: Record<RequirementType, React.ReactNode> = {
    role: <Users className="w-3 h-3" />,
    claim: <FileText className="w-3 h-3" />,
    age: <User className="w-3 h-3" />,
    custom: <Settings className="w-3 h-3" />,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${typeColors[requirement.type]}`}
    >
      {typeIcons[requirement.type]}
      <div className="flex flex-col">
        <span className="text-xs font-medium">{requirement.name}</span>
        <span className="text-[10px] opacity-70">{requirement.description}</span>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="p-1 hover:bg-background/50 rounded transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </motion.div>
  );
}

function evaluatePolicy(requirements: Requirement[], user: TestUser): boolean {
  return requirements.every((req) => {
    switch (req.type) {
      case "role":
        return user.roles.includes(req.value);
      case "claim":
        if (req.id === "dept-claim") {
          return user.claims.department === req.value;
        }
        if (req.id === "country-claim") {
          return user.claims.country === req.value;
        }
        if (req.id === "verified-email") {
          return user.claims.email_verified === "true";
        }
        return false;
      case "age":
        return user.age >= parseInt(req.value);
      default:
        return true;
    }
  });
}

export function PolicyBuilder({ mode = "beginner" }: PolicyBuilderProps) {
  const [policyName, setPolicyName] = useState("CustomPolicy");
  const [selectedRequirements, setSelectedRequirements] = useState<Requirement[]>([]);
  const [showResults, setShowResults] = useState(false);

  const addRequirement = (req: Requirement) => {
    if (!selectedRequirements.find((r) => r.id === req.id)) {
      setSelectedRequirements([...selectedRequirements, req]);
      setShowResults(false);
    }
  };

  const removeRequirement = (id: string) => {
    setSelectedRequirements(selectedRequirements.filter((r) => r.id !== id));
    setShowResults(false);
  };

  const testPolicy = () => {
    setShowResults(true);
  };

  const reset = () => {
    setSelectedRequirements([]);
    setShowResults(false);
    setPolicyName("CustomPolicy");
  };

  const generatedCode = useMemo(() => {
    if (selectedRequirements.length === 0) return null;

    let code = `builder.Services.AddAuthorization(options =>\n{\n    options.AddPolicy("${policyName}", policy =>\n    {\n`;

    const roleReqs = selectedRequirements.filter((r) => r.type === "role");
    const claimReqs = selectedRequirements.filter((r) => r.type === "claim");
    const ageReqs = selectedRequirements.filter((r) => r.type === "age");

    if (roleReqs.length > 0) {
      const roles = roleReqs.map((r) => `"${r.value}"`).join(", ");
      code += `        policy.RequireRole(${roles});\n`;
    }

    claimReqs.forEach((req) => {
      if (req.id === "dept-claim") {
        code += `        policy.RequireClaim("department", "${req.value}");\n`;
      } else if (req.id === "country-claim") {
        code += `        policy.RequireClaim("country", "${req.value}");\n`;
      } else if (req.id === "verified-email") {
        code += `        policy.RequireClaim("email_verified", "true");\n`;
      }
    });

    if (ageReqs.length > 0) {
      const minAge = Math.max(...ageReqs.map((r) => parseInt(r.value)));
      code += `        policy.Requirements.Add(new MinimumAgeRequirement(${minAge}));\n`;
    }

    code += `    });\n});`;

    return code;
  }, [selectedRequirements, policyName]);

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
              <h3 className="font-semibold text-sm">Authorization Policy Builder</h3>
              <p className="text-xs text-muted-foreground">
                {mode === "beginner" && "Build access rules by combining requirements"}
                {mode === "intermediate" && "Configure policies with roles, claims, and custom requirements"}
                {mode === "advanced" && "Design complex authorization with requirement handlers"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={reset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Beginner Analogy */}
        {mode === "beginner" && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              🎪 <strong>Think of policies like VIP area rules:</strong> &quot;Must be 21+ AND have a VIP wristband AND be on the guest list.&quot; 
              Each requirement is a check — the user must pass ALL of them to gain access.
            </p>
          </div>
        )}

        {/* Policy Name Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Key className="w-4 h-4" />
            Policy Name
          </label>
          <input
            type="text"
            value={policyName}
            onChange={(e) => setPolicyName(e.target.value)}
            className="w-full max-w-xs px-3 py-2 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
            placeholder="Enter policy name..."
          />
        </div>

        {/* Available Requirements */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Requirements (click to add)
          </h4>
          <div className="flex flex-wrap gap-2">
            {availableRequirements.map((req) => (
              <button
                key={req.id}
                onClick={() => addRequirement(req)}
                disabled={selectedRequirements.some((r) => r.id === req.id)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                  selectedRequirements.some((r) => r.id === req.id)
                    ? "opacity-50 cursor-not-allowed bg-muted"
                    : "hover:bg-muted cursor-pointer hover:border-primary/50"
                }`}
              >
                {req.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Requirements */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Policy Requirements ({selectedRequirements.length})
          </h4>
          <div className="min-h-[100px] p-4 bg-muted/30 rounded-lg border border-dashed border-border">
            {selectedRequirements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Click requirements above to add them to your policy
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {selectedRequirements.map((req) => (
                    <RequirementBadge
                      key={req.id}
                      requirement={req}
                      onRemove={() => removeRequirement(req.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Generated Code Preview */}
        {generatedCode && mode !== "beginner" && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Generated Code
            </h4>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-xs overflow-x-auto">
              <code>{generatedCode}</code>
            </pre>
          </div>
        )}

        {/* Test Policy Button */}
        <div className="flex justify-center">
          <Button
            onClick={testPolicy}
            disabled={selectedRequirements.length === 0}
            className="gap-2"
          >
            <Play className="w-4 h-4" />
            Test Policy Against Users
          </Button>
        </div>

        {/* Test Results */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Authorization Results
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {testUsers.map((user) => {
                  const isAuthorized = evaluatePolicy(selectedRequirements, user);
                  return (
                    <motion.div
                      key={user.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border ${
                        isAuthorized
                          ? "bg-green-500/10 border-green-500/30"
                          : "bg-red-500/10 border-red-500/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{user.name}</span>
                        {isAuthorized ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            Authorized
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
                            <XCircle className="w-4 h-4" />
                            Denied
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>
                          <strong>Roles:</strong> {user.roles.length > 0 ? user.roles.join(", ") : "None"}
                        </p>
                        <p>
                          <strong>Age:</strong> {user.age}
                        </p>
                        <p>
                          <strong>Dept:</strong> {user.claims.department} | <strong>Country:</strong>{" "}
                          {user.claims.country}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced: Usage Example */}
        {mode === "advanced" && (
          <div className="p-4 bg-muted/30 rounded-lg border space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Using the Policy
            </h4>
            <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs overflow-x-auto">
              <code>{`// On Controller or Action
[Authorize(Policy = "${policyName}")]
public IActionResult SecretData() { ... }

// In Minimal APIs
app.MapGet("/admin", () => "Secret!")
   .RequireAuthorization("${policyName}");

// Imperative authorization
if (await authService.AuthorizeAsync(User, "${policyName}"))
{
    // Access granted
}`}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
