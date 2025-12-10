import { auth, currentUser } from "@clerk/nextjs/server";
import { cache } from "react";

import type { AIProviderType } from "@/lib/ai/types";

export interface AuthUser {
  clerkId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  byokApiKey: string | null; // Legacy accessor for OpenRouter
  openRouterApiKey: string | null;
  googleApiKey: string | null;
  isAdmin: boolean;
}

/**
 * Cached version of currentUser() - deduplicates calls within a single request
 */
const getCachedCurrentUser = cache(async () => {
  return currentUser();
});

/**
 * Cached version of auth() - deduplicates calls within a single request
 */
const getCachedAuth = cache(async () => {
  return auth();
});

/**
 * Get the current authenticated user's Clerk ID
 * Throws if not authenticated
 */
export async function getAuthUserId(): Promise<string> {
  const { userId } = await getCachedAuth();

  if (!userId) {
    throw new Error("Unauthorized: No user session found");
  }

  return userId;
}

export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
  const user = await getCachedCurrentUser();

  if (!user) {
    return null;
  }

  // Get API keys from user's private metadata
  const openRouterApiKey = (user.privateMetadata?.openRouterApiKey as string) ?? null;
  const googleApiKey = (user.privateMetadata?.googleApiKey as string) ?? null;
  const byokApiKey = openRouterApiKey; // Legacy support

  // Get admin role from user's public metadata
  const isAdmin = (user.publicMetadata?.role as string) === "admin";

  return {
    clerkId: user.id,
    email: user.emailAddresses[0]?.emailAddress ?? null,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    byokApiKey,
    openRouterApiKey,
    googleApiKey,
    isAdmin,
  };
});

/**
 * Check if the current user has any BYOK API key configured
 */
export async function hasByokApiKey(provider?: AIProviderType): Promise<boolean> {
  const user = await getAuthUser();
  if (!user) return false;
  
  if (provider === 'google') return !!user.googleApiKey;
  if (provider === 'openrouter') return !!user.openRouterApiKey;
  
  // If no provider specified, check if ANY key exists (legacy behavior)
  return !!user.openRouterApiKey || !!user.googleApiKey;
}

/**
 * Get the current user's BYOK API key for a specific provider
 * Defaults to OpenRouter for backward compatibility
 */
export async function getByokApiKey(provider: AIProviderType = 'openrouter'): Promise<string | null> {
  const user = await getAuthUser();
  if (!user) return null;
  
  if (provider === 'google') return user.googleApiKey;
  return user.openRouterApiKey;
}

/**
 * BYOK tier configuration type (matches BYOKUserConfig from schemas)
 */
export interface BYOKTierConfigData {
  high?: { provider?: AIProviderType; model: string; fallback?: string; temperature?: number; maxTokens?: number };
  medium?: { provider?: AIProviderType; model: string; fallback?: string; temperature?: number; maxTokens?: number };
  low?: { provider?: AIProviderType; model: string; fallback?: string; temperature?: number; maxTokens?: number };
}

/**
 * Get the current user's BYOK tier configuration if configured
 */
export async function getByokTierConfig(): Promise<BYOKTierConfigData | null> {
  const user = await getCachedCurrentUser();
  if (!user) return null;
  
  const tierConfig = user.privateMetadata?.byokTierConfig as BYOKTierConfigData | undefined;
  return tierConfig ?? null;
}

/**
 * Check if the current user has admin role
 * Uses cached getAuthUser to avoid duplicate Clerk API calls
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getAuthUser();
  return user?.isAdmin ?? false;
}

/**
 * Check if the current user is suspended
 * Returns true if suspended, false otherwise
 */
export async function isUserSuspended(): Promise<boolean> {
  const { userId } = await getCachedAuth();
  if (!userId) return false;

  // Dynamic import to avoid circular dependencies
  const { getUsersCollection } = await import("@/lib/db/collections");
  const usersCollection = await getUsersCollection();
  const user = await usersCollection.findOne({ clerkId: userId });

  return user?.suspended ?? false;
}

/**
 * Authorization error response type for admin actions
 */
export interface UnauthorizedResponse {
  success: false;
  error: string;
}

/**
 * Require admin authorization for a server action
 * Returns { success: false, error: "Unauthorized" } if user is not an admin
 * Otherwise executes the provided function and returns its result
 */
export async function requireAdmin<T>(
  fn: () => Promise<T>
): Promise<T | UnauthorizedResponse> {
  const userIsAdmin = await isAdmin();

  if (!userIsAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  return fn();
}
