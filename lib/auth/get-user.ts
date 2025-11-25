import { auth, currentUser } from '@clerk/nextjs/server';

export interface AuthUser {
  clerkId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  byokApiKey: string | null;
}

/**
 * Get the current authenticated user's Clerk ID
 * Throws if not authenticated
 */
export async function getAuthUserId(): Promise<string> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized: No user session found');
  }
  
  return userId;
}

/**
 * Get the current authenticated user with full details
 * Returns null if not authenticated
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const user = await currentUser();
  
  if (!user) {
    return null;
  }
  
  // Get BYOK API key from user's private metadata
  const byokApiKey = (user.privateMetadata?.openRouterApiKey as string) ?? null;
  
  return {
    clerkId: user.id,
    email: user.emailAddresses[0]?.emailAddress ?? null,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    byokApiKey,
  };
}

/**
 * Check if the current user has a BYOK API key configured
 */
export async function hasByokApiKey(): Promise<boolean> {
  const user = await getAuthUser();
  return user?.byokApiKey !== null && user?.byokApiKey !== '';
}

/**
 * Get the current user's BYOK API key if configured
 */
export async function getByokApiKey(): Promise<string | null> {
  const user = await getAuthUser();
  return user?.byokApiKey ?? null;
}
