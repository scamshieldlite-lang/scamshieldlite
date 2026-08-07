// apps/backend/src/services/tierResolver.service.ts

import { subscriptionService } from "./subscription.service.js";
import type { UserTier } from "@/config/rateLimits.js";
import { logger } from "@/utils/logger.js";

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
        logger.warn(
          { userId },
          "User has no subscription row — defaulting to trialing",
        );
        // Auto-create missing trial subscription on the fly
        await subscriptionService.createTrialSubscription(userId, 20); // or default trial length
        // Ensure new users default to trialing rather than locked out
        return "trialing";
      }

      const now = Date.now();

      switch (sub.status) {
        case "trialing": {
          const trialEndMs = sub.trialEnd
            ? new Date(sub.trialEnd).getTime()
            : 0;
          const isActive = trialEndMs > now;
          return isActive ? "trialing" : "expired";
        }
        case "active": {
          const periodEndMs = sub.currentPeriodEnd
            ? new Date(sub.currentPeriodEnd).getTime()
            : 0;
          const isActive = periodEndMs > now;
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
