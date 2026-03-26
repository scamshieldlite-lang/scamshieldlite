// apps/backend/src/services/tierResolver.service.ts

import { subscriptionService } from "./subscription.service";
import type { UserTier } from "@/config/rateLimits";
import { logger } from "@/utils/logger";

export const tierResolverService = {
  /**
   * Resolve the rate limit tier for a given request context.
   *
   * Guest    → no userId
   * Trialing → userId + active trial subscription
   * Paid     → userId + active paid subscription
   * Expired  → userId + expired/cancelled subscription
   */
  async resolveTier(userId?: string): Promise<UserTier> {
    if (!userId) {
      return "guest";
    }

    try {
      const sub = await subscriptionService.getSubscription(userId);

      if (!sub) {
        // Registered user with no subscription row — treat as guest-level
        logger.warn({ userId }, "User has no subscription row");
        return "expired";
      }

      switch (sub.status) {
        case "trialing": {
          const isActive = sub.trialEnd > new Date();
          return isActive ? "trialing" : "expired";
        }
        case "active": {
          const isActive =
            !!sub.currentPeriodEnd && sub.currentPeriodEnd > new Date();
          return isActive ? "paid" : "expired";
        }
        case "expired":
        case "cancelled":
          return "expired";
        default:
          return "expired";
      }
    } catch (error) {
      logger.error(
        { error, userId },
        "Failed to resolve tier — defaulting to expired",
      );
      return "expired";
    }
  },
};
