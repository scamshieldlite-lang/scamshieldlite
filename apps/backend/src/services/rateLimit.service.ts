// apps/backend/src/services/rateLimit.service.ts

import { auditLogService } from "./auditLog.service.js";
import { tierResolverService } from "./tierResolver.service.js";
import { getLimitForTier } from "@/config/rateLimits.js";
import { hashIp } from "@/utils/hash.js";
import { logger } from "@/utils/logger.js";

export interface RateLimitIdentity {
  userId?: string;
  deviceFingerprint?: string;
  ip?: string; // raw — will be hashed internally
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  count: number;
  remaining: number;
  tier: string;
  resetAt: Date;
}

export const rateLimitService = {
  /**
   * Check whether this identity is within their scan limit.
   * If allowed, log the attempt to audit_logs.
   *
   * This is the single entry point called by the rate limit middleware.
   */
  async checkAndLog(identity: RateLimitIdentity): Promise<RateLimitResult> {
    const ipHash = identity.ip ? hashIp(identity.ip) : undefined;

    // 1. Resolve tier based on subscription status
    const tier = await tierResolverService.resolveTier(identity.userId);
    const { dailyLimit, windowMs } = getLimitForTier(tier);

    // 2. Count existing scans in the rolling window
    const count = await auditLogService.countScansInWindow({
      userId: identity.userId,
      deviceFingerprint: identity.deviceFingerprint,
      ipHash,
      windowMs,
    });

    const allowed = count < dailyLimit;
    const remaining = Math.max(0, dailyLimit - count - (allowed ? 1 : 0));
    const resetAt = new Date(Date.now() + windowMs);

    // 3. Only log if the request is allowed — don't count blocked attempts
    if (allowed) {
      await auditLogService.log({
        action: "scan",
        userId: identity.userId,
        deviceFingerprint: identity.deviceFingerprint,
        ipHash,
        metadata: { tier },
      });
    }

    logger.debug(
      {
        userId: identity.userId,
        deviceFingerprint: identity.deviceFingerprint
          ? identity.deviceFingerprint.substring(0, 8) + "..."
          : undefined,
        tier,
        count,
        dailyLimit,
        allowed,
      },
      "Rate limit check",
    );

    return { allowed, limit: dailyLimit, count, remaining, tier, resetAt };
  },

  /**
   * Get current usage without logging or blocking.
   * Used by the mobile app to show "X scans remaining" in the UI.
   */
  async getUsage(identity: RateLimitIdentity): Promise<RateLimitResult> {
    const ipHash = identity.ip ? hashIp(identity.ip) : undefined;
    const tier = await tierResolverService.resolveTier(identity.userId);
    const { dailyLimit, windowMs } = getLimitForTier(tier);

    const count = await auditLogService.countScansInWindow({
      userId: identity.userId,
      deviceFingerprint: identity.deviceFingerprint,
      ipHash,
      windowMs,
    });

    return {
      allowed: count < dailyLimit,
      limit: dailyLimit,
      count,
      remaining: Math.max(0, dailyLimit - count),
      tier,
      resetAt: new Date(Date.now() + windowMs),
    };
  },
};
