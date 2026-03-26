import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/utils/logger";

// Keep your helpful types
export type SubscriptionStatus =
  | { active: true; reason: "trial" | "paid" }
  | {
      active: false;
      reason: "no_subscription" | "trial_expired" | "subscription_expired";
    };

export const subscriptionService = {
  /**
   * Fetch the full subscription row for a user.
   */
  async getSubscription(userId: string) {
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    return sub || null;
  },

  /**
   * Create a new trial - perfect for your auth hook
   */
  async createTrialSubscription(
    userId: string,
    trialDays: number,
  ): Promise<void> {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + trialDays);

    await db.insert(subscriptions).values({
      userId,
      status: "trialing",
      trialStart: new Date(),
      trialEnd,
    });

    logger.info({ userId, trialEnd }, "Trial subscription created");
  },

  /**
   * Your detailed logic - use this for API responses to the frontend
   */

  async getStatus(userId: string): Promise<SubscriptionStatus> {
    // Use standard select syntax to bypass the Query API type conflict
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (!sub) return { active: false, reason: "no_subscription" };

    const now = new Date();

    if (sub.status === "trialing") {
      // Check if trialEnd exists and compare
      return sub.trialEnd && new Date(sub.trialEnd) > now
        ? { active: true, reason: "trial" }
        : { active: false, reason: "trial_expired" };
    }

    if (sub.status === "active" && sub.currentPeriodEnd) {
      return new Date(sub.currentPeriodEnd) > now
        ? { active: true, reason: "paid" }
        : { active: false, reason: "subscription_expired" };
    }

    return { active: false, reason: "subscription_expired" };
  },

  /**
   * Simple boolean check - use this for quick middleware guards
   */
  async hasAccess(userId: string): Promise<boolean> {
    const status = await this.getStatus(userId);
    return status.active;
  },

  /**
   * UI helper for the dashboard
   */
  getTrialDaysRemaining(trialEnd: Date | null): number {
    if (!trialEnd) return 0;
    const now = new Date();
    const diff = trialEnd.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  },
};
