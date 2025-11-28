'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { createCheckoutSession, createCustomerPortalSession, upgradeSubscription, downgradeSubscription as stripeDowngrade, getSubscription, cancelSubscription, getSubscriptionPeriodEnd } from '@/lib/services/stripe';
import { userRepository } from '@/lib/db/repositories/user-repository';
import { getAuthUserId } from '@/lib/auth/get-user';
import { MAX_ITERATION_LIMIT, MAX_INTERVIEW_LIMIT, PRO_ITERATION_LIMIT, PRO_INTERVIEW_LIMIT } from '@/lib/pricing-data';

export type SubscriptionPlan = 'PRO' | 'MAX';

export interface CheckoutResult {
  success: boolean;
  url?: string;
  upgraded?: boolean;
  error?: string;
}

export async function createCheckout(plan: SubscriptionPlan): Promise<CheckoutResult> {
  try {
    const { userId: clerkId } = await auth();
    const user = await currentUser();

    if (!clerkId || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get or create user in our database
    let dbUser = await userRepository.findByClerkId(clerkId);
    if (!dbUser) {
      dbUser = await userRepository.create({
        clerkId,
        plan: 'FREE',
        preferences: {
          theme: 'dark',
          defaultAnalogy: 'professional',
        },
      });
    }

    // Check if user has an active subscription and wants to upgrade
    if (dbUser.stripeSubscriptionId && dbUser.plan === 'PRO' && plan === 'MAX') {
      // Verify the subscription is still active
      const subscription = await getSubscription(dbUser.stripeSubscriptionId);
      if (subscription && subscription.status === 'active' && !subscription.cancel_at_period_end) {
        // Upgrade with proration instead of creating new checkout
        await upgradeSubscription({
          subscriptionId: dbUser.stripeSubscriptionId,
          newPlan: plan,
          clerkId,
        });
        
        // Update the plan in database immediately (don't wait for webhook)
        await userRepository.updatePlan(clerkId, 'MAX', MAX_ITERATION_LIMIT, MAX_INTERVIEW_LIMIT);
        
        return { success: true, upgraded: true };
      }
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return { success: false, error: 'No email address found' };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const url = await createCheckoutSession({
      userId: dbUser._id,
      clerkId,
      email,
      plan,
      successUrl: `${appUrl}/dashboard?checkout=success`,
      cancelUrl: `${appUrl}/pricing?checkout=cancelled`,
    });

    return { success: true, url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    return { success: false, error: message };
  }
}


export async function createPortalSession(): Promise<CheckoutResult> {
  try {
    const clerkId = await getAuthUserId();
    const dbUser = await userRepository.findByClerkId(clerkId);
    
    if (!dbUser?.stripeCustomerId) {
      return { success: false, error: 'No subscription found' };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const url = await createCustomerPortalSession(
      dbUser.stripeCustomerId,
      `${appUrl}/settings`
    );

    return { success: true, url };
  } catch (error) {
    console.error('Error creating portal session:', error);
    const message = error instanceof Error ? error.message : 'Failed to create portal session';
    return { success: false, error: message };
  }
}

/**
 * @deprecated Use getSettingsPageData() from user.ts for settings page
 * Kept for backward compatibility with other pages
 */
export async function getUserSubscriptionStatus() {
  try {
    const clerkId = await getAuthUserId();
    const dbUser = await userRepository.findByClerkId(clerkId);
    
    if (!dbUser) {
      return { plan: 'FREE' as const, hasSubscription: false };
    }

    return {
      plan: dbUser.plan,
      hasSubscription: !!dbUser.stripeCustomerId,
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return { plan: 'FREE' as const, hasSubscription: false };
  }
}

export type DowngradePlan = 'PRO' | 'FREE';

export interface DowngradeResult {
  success: boolean;
  scheduledForEndOfPeriod?: boolean;
  currentPeriodEnd?: string;
  error?: string;
}

export async function downgradeSubscription(targetPlan: DowngradePlan): Promise<DowngradeResult> {
  try {
    const clerkId = await getAuthUserId();
    const dbUser = await userRepository.findByClerkId(clerkId);

    if (!dbUser) {
      return { success: false, error: 'User not found' };
    }

    if (!dbUser.stripeSubscriptionId) {
      return { success: false, error: 'No active subscription found' };
    }

    // Validate downgrade path
    if (dbUser.plan === 'FREE') {
      return { success: false, error: 'Already on FREE plan' };
    }

    if (dbUser.plan === 'PRO' && targetPlan === 'PRO') {
      return { success: false, error: 'Already on PRO plan' };
    }

    if (dbUser.plan === 'PRO' && targetPlan !== 'FREE') {
      return { success: false, error: 'Can only downgrade to FREE from PRO' };
    }

    // Verify subscription is active
    const subscription = await getSubscription(dbUser.stripeSubscriptionId);
    if (!subscription || subscription.status !== 'active') {
      return { success: false, error: 'Subscription is not active' };
    }

    if (subscription.cancel_at_period_end) {
      return { success: false, error: 'Subscription is already scheduled for cancellation' };
    }

    // Perform the downgrade
    const updatedSubscription = await stripeDowngrade({
      subscriptionId: dbUser.stripeSubscriptionId,
      newPlan: targetPlan,
      clerkId,
    });

    // For MAX → PRO, update the plan immediately since Stripe applies it at next billing
    // The webhook will also handle this, but we update now for immediate UI feedback
    if (targetPlan === 'PRO' && dbUser.plan === 'MAX') {
      await userRepository.updatePlan(clerkId, 'PRO', PRO_ITERATION_LIMIT, PRO_INTERVIEW_LIMIT);
    }

    const periodEnd = new Date(getSubscriptionPeriodEnd(updatedSubscription) * 1000).toISOString();

    return {
      success: true,
      scheduledForEndOfPeriod: targetPlan === 'FREE',
      currentPeriodEnd: periodEnd,
    };
  } catch (error) {
    console.error('Error downgrading subscription:', error);
    const message = error instanceof Error ? error.message : 'Failed to downgrade subscription';
    return { success: false, error: message };
  }
}

export async function cancelSubscriptionAction(): Promise<DowngradeResult> {
  try {
    const clerkId = await getAuthUserId();
    const dbUser = await userRepository.findByClerkId(clerkId);

    if (!dbUser?.stripeSubscriptionId) {
      return { success: false, error: 'No active subscription found' };
    }

    const subscription = await getSubscription(dbUser.stripeSubscriptionId);
    if (!subscription || subscription.status !== 'active') {
      return { success: false, error: 'Subscription is not active' };
    }

    if (subscription.cancel_at_period_end) {
      return { success: false, error: 'Subscription is already scheduled for cancellation' };
    }

    const updatedSubscription = await cancelSubscription(dbUser.stripeSubscriptionId);
    const periodEnd = new Date(getSubscriptionPeriodEnd(updatedSubscription) * 1000).toISOString();

    return {
      success: true,
      scheduledForEndOfPeriod: true,
      currentPeriodEnd: periodEnd,
    };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    const message = error instanceof Error ? error.message : 'Failed to cancel subscription';
    return { success: false, error: message };
  }
}
