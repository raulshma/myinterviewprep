"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  FileJson,
  Lock,
  Shield,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  User,
  Fingerprint,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface JwtTokenVisualizerProps {
  mode?: "beginner" | "intermediate" | "advanced";
  initialToken?: string;
}

type TokenSection = "header" | "payload" | "signature";

interface DecodedToken {
  header: Record<string, string>;
  payload: Record<string, string | number>;
}

// Sample JWT for demonstration
const sampleToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6IkFkbWluIiwiaWF0IjoxNzAyNjQ4MDAwLCJleHAiOjE3MDI2NTE2MDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const sectionColors: Record<TokenSection, string> = {
  header: "bg-red-500/10 text-red-600 border-red-500/30",
  payload: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  signature: "bg-blue-500/10 text-blue-600 border-blue-500/30",
};

const sectionIcons: Record<TokenSection, React.ReactNode> = {
  header: <FileJson className="w-4 h-4" />,
  payload: <User className="w-4 h-4" />,
  signature: <Fingerprint className="w-4 h-4" />,
};

function base64UrlDecode(str: string): string {
  try {
    // Replace URL-safe characters
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    // Pad if necessary
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return atob(padded);
  } catch {
    return "{}";
  }
}

function parseToken(token: string): { parts: string[]; decoded: DecodedToken } {
  const parts = token.split(".");
  
  let header: Record<string, string> = {};
  let payload: Record<string, string | number> = {};
  
  try {
    header = JSON.parse(base64UrlDecode(parts[0] || ""));
  } catch {
    header = { error: "Invalid header" };
  }
  
  try {
    payload = JSON.parse(base64UrlDecode(parts[1] || ""));
  } catch {
    payload = { error: "Invalid payload" };
  }
  
  return {
    parts,
    decoded: { header, payload },
  };
}

function ClaimBadge({ claim, value, icon }: { claim: string; value: string | number; icon?: React.ReactNode }) {
  const claimDescriptions: Record<string, string> = {
    sub: "Subject - Unique user identifier",
    iss: "Issuer - Who created this token",
    aud: "Audience - Who this token is for",
    exp: "Expiration - When token expires",
    iat: "Issued At - When token was created",
    nbf: "Not Before - Token not valid before this time",
    jti: "JWT ID - Unique token identifier",
    name: "User's display name",
    email: "User's email address",
    role: "User's role for authorization",
  };

  const isExpiration = claim === "exp" || claim === "iat" || claim === "nbf";
  const displayValue = isExpiration && typeof value === "number"
    ? new Date(value * 1000).toLocaleString()
    : String(value);

  return (
    <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
      <div className="p-1.5 bg-muted rounded">
        {icon || <Key className="w-3 h-3" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-foreground">{claim}</span>
          {claimDescriptions[claim] && (
            <span className="text-[10px] text-muted-foreground">({claimDescriptions[claim]})</span>
          )}
        </div>
        <div className="font-mono text-xs text-muted-foreground truncate mt-0.5">
          {displayValue}
        </div>
      </div>
    </div>
  );
}

export function JwtTokenVisualizer({
  mode = "beginner",
  initialToken = sampleToken,
}: JwtTokenVisualizerProps) {
  const [token, setToken] = useState(initialToken);
  const [activeSection, setActiveSection] = useState<TokenSection | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  const { parts, decoded } = useMemo(() => parseToken(token), [token]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [isExpired] = useState(() => {
    if (decoded.payload.exp && typeof decoded.payload.exp === "number") {
      return decoded.payload.exp * 1000 < Date.now();
    }
    return false;
  });

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
              <h3 className="font-semibold text-sm">JWT Token Visualizer</h3>
              <p className="text-xs text-muted-foreground">
                {mode === "beginner" && "See what's inside a JSON Web Token"}
                {mode === "intermediate" && "Decode and inspect token structure"}
                {mode === "advanced" && "Analyze claims, signatures, and validation"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowRaw(!showRaw)} className="gap-2">
              {showRaw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showRaw ? "Decoded" : "Raw"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Beginner Analogy */}
        {mode === "beginner" && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              🎫 <strong>Think of JWT like a concert ticket:</strong> It has your info (name, seat), 
              who issued it (venue), and a security stamp (signature) that proves it&apos;s real. 
              The bouncer (server) can verify it without calling the box office!
            </p>
          </div>
        )}

        {/* Token Status */}
        {isExpired && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600 dark:text-red-400">
              This token has expired and would be rejected by the server
            </span>
          </div>
        )}

        {/* Token Display */}
        <div className="relative">
          <div className="font-mono text-xs p-4 bg-muted/50 rounded-lg border overflow-x-auto">
            {showRaw ? (
              <div className="break-all">
                <span
                  className={`cursor-pointer transition-opacity ${activeSection === "header" ? "opacity-100" : "opacity-70 hover:opacity-100"} ${activeSection === "header" ? "bg-red-500/20 rounded px-1" : ""}`}
                  onMouseEnter={() => setActiveSection("header")}
                  onMouseLeave={() => setActiveSection(null)}
                  style={{ color: "rgb(239 68 68)" }}
                >
                  {parts[0]}
                </span>
                <span className="text-muted-foreground">.</span>
                <span
                  className={`cursor-pointer transition-opacity ${activeSection === "payload" ? "opacity-100" : "opacity-70 hover:opacity-100"} ${activeSection === "payload" ? "bg-purple-500/20 rounded px-1" : ""}`}
                  onMouseEnter={() => setActiveSection("payload")}
                  onMouseLeave={() => setActiveSection(null)}
                  style={{ color: "rgb(168 85 247)" }}
                >
                  {parts[1]}
                </span>
                <span className="text-muted-foreground">.</span>
                <span
                  className={`cursor-pointer transition-opacity ${activeSection === "signature" ? "opacity-100" : "opacity-70 hover:opacity-100"} ${activeSection === "signature" ? "bg-blue-500/20 rounded px-1" : ""}`}
                  onMouseEnter={() => setActiveSection("signature")}
                  onMouseLeave={() => setActiveSection(null)}
                  style={{ color: "rgb(59 130 246)" }}
                >
                  {parts[2]}
                </span>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Token is encoded - click &quot;Raw&quot; to see the Base64 format</p>
              </div>
            )}
          </div>
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["header", "payload", "signature"] as TokenSection[]).map((section) => (
            <motion.div
              key={section}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${sectionColors[section]} ${
                activeSection === section ? "ring-2 ring-offset-2 ring-primary" : ""
              }`}
              onMouseEnter={() => setActiveSection(section)}
              onMouseLeave={() => setActiveSection(null)}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-2">
                {sectionIcons[section]}
                <span className="font-semibold text-sm capitalize">{section}</span>
              </div>
              <p className="text-xs opacity-80">
                {section === "header" && "Algorithm & token type"}
                {section === "payload" && "User data & claims"}
                {section === "signature" && "Verification hash"}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Decoded Content */}
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-4"
          >
            {/* Header Section */}
            <div className="p-4 bg-red-500/5 rounded-lg border border-red-500/20">
              <div className="flex items-center gap-2 mb-3">
                <FileJson className="w-4 h-4 text-red-500" />
                <span className="font-semibold text-sm text-red-600 dark:text-red-400">Header</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(decoded.header).map(([key, value]) => (
                  <ClaimBadge key={key} claim={key} value={value} icon={<FileJson className="w-3 h-3" />} />
                ))}
              </div>
            </div>

            {/* Payload Section */}
            <div className="p-4 bg-purple-500/5 rounded-lg border border-purple-500/20">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-purple-500" />
                <span className="font-semibold text-sm text-purple-600 dark:text-purple-400">Payload (Claims)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(decoded.payload).map(([key, value]) => (
                  <ClaimBadge
                    key={key}
                    claim={key}
                    value={value}
                    icon={
                      key === "exp" || key === "iat" || key === "nbf" ? (
                        <Clock className="w-3 h-3" />
                      ) : key === "role" ? (
                        <Shield className="w-3 h-3" />
                      ) : (
                        <User className="w-3 h-3" />
                      )
                    }
                  />
                ))}
              </div>
            </div>

            {/* Signature Section */}
            <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Fingerprint className="w-4 h-4 text-blue-500" />
                <span className="font-semibold text-sm text-blue-600 dark:text-blue-400">Signature</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-2">
                <p>
                  The signature is created by hashing the header + payload with a secret key.
                  Only the server knows this secret, so it can verify the token wasn&apos;t tampered with.
                </p>
                {mode !== "beginner" && (
                  <div className="font-mono bg-background p-2 rounded border text-[10px]">
                    HMACSHA256(base64UrlEncode(header) + &quot;.&quot; + base64UrlEncode(payload), secret)
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Advanced: Security Notes */}
        {mode === "advanced" && (
          <div className="p-4 bg-muted/30 rounded-lg border space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Considerations
            </h4>
            <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
              <li>Never store sensitive data in the payload - it&apos;s only Base64 encoded, not encrypted</li>
              <li>Always validate the signature server-side before trusting claims</li>
              <li>Use short expiration times and implement refresh token rotation</li>
              <li>Prefer RS256 (RSA) over HS256 (HMAC) for distributed systems</li>
              <li>Store tokens securely - HttpOnly cookies for web, secure storage for mobile</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
