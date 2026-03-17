import { db } from "../db";
import { subscriptions } from "../db/schema";
import { eq } from "drizzle-orm";

export type SubscriptionStatus =
  | { active: true; reason: "trial" | "paid" }
  | {
      active: false;
      reason: "no_subscription" | "trial_expired" | "subscription_expired";
    };

export async function getSubscriptionStatus(
  userId: string,
): Promise<SubscriptionStatus> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (!sub) return { active: false, reason: "no_subscription" };

  const now = new Date();

  if (sub.status === "trialing") {
    return sub.trialEnd > now
      ? { active: true, reason: "trial" }
      : { active: false, reason: "trial_expired" };
  }

  if (sub.status === "active" && sub.currentPeriodEnd) {
    return sub.currentPeriodEnd > now
      ? { active: true, reason: "paid" }
      : { active: false, reason: "subscription_expired" };
  }

  return { active: false, reason: "subscription_expired" };
}

// Returns days remaining in trial (0 if expired/not trialing)
export function getTrialDaysRemaining(trialEnd: Date): number {
  const now = new Date();
  const diff = trialEnd.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
