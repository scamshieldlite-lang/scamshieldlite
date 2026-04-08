import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { googlePlayService } from "./googlePlay.service";
import { nowPlusDays, isExpired } from "@/utils/date";
import { logger } from "@/utils/logger";
import type {
  SubscriptionPlan,
  SubscriptionState,
} from "@scamshieldlite/shared/";

export const subscriptionService = {
  // ── Create trial ─────────────────────────────────────────────

  async createTrialSubscription(
    userId: string,
    trialDays: number,
  ): Promise<void> {
    const trialEnd = nowPlusDays(trialDays);

    // Upsert — safe to call even if row already exists
    await db
      .insert(subscriptions)
      .values({
        userId,
        status: "trialing",
        trialStart: new Date(),
        trialEnd,
        updatedAt: new Date(),
      })
      .onConflictDoNothing();

    logger.info({ userId, trialEnd }, "Trial subscription created");
  },

  // ── Read ──────────────────────────────────────────────────────

  async getSubscription(userId: string) {
    return db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
    });
  },

  async getSubscriptionState(userId: string): Promise<SubscriptionState> {
    const sub = await this.getSubscription(userId);

    if (!sub) {
      return this.buildState(null);
    }

    // Auto-expire stale trialing rows
    if (sub.status === "trialing" && sub.trialEnd < new Date()) {
      await db
        .update(subscriptions)
        .set({ status: "expired", updatedAt: new Date() })
        .where(eq(subscriptions.userId, userId));

      return this.buildState({ ...sub, status: "expired" });
    }

    // Auto-expire stale active rows
    if (
      sub.status === "active" &&
      sub.currentPeriodEnd &&
      sub.currentPeriodEnd < new Date()
    ) {
      await db
        .update(subscriptions)
        .set({ status: "expired", updatedAt: new Date() })
        .where(eq(subscriptions.userId, userId));

      return this.buildState({ ...sub, status: "expired" });
    }

    return this.buildState(sub);
  },

  // ── Convenience checks ────────────────────────────────────────

  async isTrialActive(userId: string): Promise<boolean> {
    const sub = await this.getSubscription(userId);
    if (!sub) return false;
    return sub.status === "trialing" && sub.trialEnd > new Date();
  },

  async isPaidActive(userId: string): Promise<boolean> {
    const sub = await this.getSubscription(userId);
    if (!sub) return false;
    return (
      sub.status === "active" &&
      !!sub.currentPeriodEnd &&
      sub.currentPeriodEnd > new Date()
    );
  },

  async hasFullAccess(userId: string): Promise<boolean> {
    return (
      (await this.isTrialActive(userId)) || (await this.isPaidActive(userId))
    );
  },

  // ── Purchase verification ─────────────────────────────────────

  async verifyAndActivate(
    userId: string,
    purchaseToken: string,
    productId: string,
  ): Promise<SubscriptionState> {
    // 1. Verify with Google Play
    const purchaseInfo = await googlePlayService.verifySubscription(
      purchaseToken,
      productId,
    );

    if (!purchaseInfo) {
      throw new Error("Purchase verification failed — invalid token");
    }

    // 2. Calculate period end from Play API response
    const currentPeriodEnd = new Date(parseInt(purchaseInfo.expiryTimeMillis));

    // 3. Upsert subscription row
    await db
      .insert(subscriptions)
      .values({
        userId,
        status: "active",
        planId: productId,
        trialStart: new Date(),
        trialEnd: new Date(), // Trial superseded by paid
        currentPeriodEnd,
        playPurchaseToken: purchaseToken,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: subscriptions.userId,
        set: {
          status: "active",
          planId: productId,
          currentPeriodEnd,
          playPurchaseToken: purchaseToken,
          updatedAt: new Date(),
        },
      });

    // 4. Acknowledge purchase (required by Google Play within 3 days)
    await googlePlayService.acknowledgePurchase(purchaseToken, productId);

    logger.info(
      { userId, productId, currentPeriodEnd },
      "Subscription activated",
    );

    return this.getSubscriptionState(userId);
  },

  // ── Webhook handlers ──────────────────────────────────────────

  async handleRenewal(
    userId: string,
    purchaseToken: string,
    productId: string,
    expiryTimeMillis: string,
  ): Promise<void> {
    const currentPeriodEnd = new Date(parseInt(expiryTimeMillis));

    await db
      .update(subscriptions)
      .set({
        status: "active",
        currentPeriodEnd,
        playPurchaseToken: purchaseToken,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId));

    logger.info({ userId, currentPeriodEnd }, "Subscription renewed via RTDN");
  },

  async handleCancellation(userId: string): Promise<void> {
    await db
      .update(subscriptions)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId));

    logger.info({ userId }, "Subscription cancelled via RTDN");
  },

  // ── State builder ─────────────────────────────────────────────

  buildState(sub: typeof subscriptions.$inferSelect | null): SubscriptionState {
    if (!sub) {
      return {
        plan: "guest",
        status: null,
        trialEndsAt: null,
        currentPeriodEnd: null,
        isTrialActive: false,
        isPaidActive: false,
        hasFullAccess: false,
        daysRemaining: null,
      };
    }

    const now = new Date();
    const isTrialActive = sub.status === "trialing" && sub.trialEnd > now;
    const isPaidActive =
      sub.status === "active" &&
      !!sub.currentPeriodEnd &&
      sub.currentPeriodEnd > now;

    const hasFullAccess = isTrialActive || isPaidActive;

    // Days remaining calculation
    let daysRemaining: number | null = null;
    if (sub.currentPeriodEnd && sub.currentPeriodEnd > now) {
      daysRemaining = Math.ceil(
        (sub.currentPeriodEnd.getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      );
    }
    // 2. Fall back to Trial if no paid period exists
    else if (isTrialActive) {
      daysRemaining = Math.ceil(
        (sub.trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
    }

    const plan: SubscriptionPlan = isPaidActive
      ? "paid"
      : isTrialActive
        ? "free_trial"
        : "expired";

    return {
      plan,
      status: sub.status,
      trialEndsAt: sub.trialEnd.toISOString(),
      currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
      isTrialActive,
      isPaidActive,
      hasFullAccess,
      daysRemaining,
    };
  },
};
