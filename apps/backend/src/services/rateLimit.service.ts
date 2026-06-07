import { auditLogService } from "./auditLog.service.js";
import { tierResolverService } from "./tierResolver.service.js";
import { getLimitForTier } from "@/config/rateLimits.js";
import { hashIp } from "@/utils/hash.js";
import { logger } from "@/utils/logger.js";

export interface RateLimitIdentity {
  userId?: string;
  deviceFingerprint?: string;
  ip?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  count: number;
  remaining: number;
  tier: string;
  resetAt: Date | null;
  isLifetime: boolean;
}

export const rateLimitService = {
  async checkAndLog(identity: RateLimitIdentity): Promise<RateLimitResult> {
    const ipHash = identity.ip ? hashIp(identity.ip) : undefined;
    const tier = await tierResolverService.resolveTier(identity.userId);
    const { dailyLimit, windowMs, isLifetime } = getLimitForTier(tier);

    // 1. Fetch historical record count directly
    const count = await auditLogService.countScansInWindow({
      userId: identity.userId,
      deviceFingerprint: identity.deviceFingerprint,
      ipHash,
      windowMs: isLifetime || tier === "guest" ? null : windowMs,
    });

    // 2. Clear, explicit check: Has this specific guest hit or exceeded 3?
    const allowed = count < dailyLimit;

    // Calculate remaining strictly based on historical insertions
    const remaining = Math.max(0, dailyLimit - count);

    if (allowed) {
      // Record this explicit action to database log IMMEDIATELY
      await auditLogService.log({
        action: "scan",
        userId: identity.userId,
        deviceFingerprint: identity.deviceFingerprint,
        ipHash,
        metadata: { tier, isLifetime },
      });
    }

    return {
      allowed,
      limit: dailyLimit,
      count: allowed ? count + 1 : count, // Reflect the scan just processed
      remaining: allowed ? Math.max(0, remaining - 1) : 0,
      tier,
      resetAt: null, // Hardcoded null for lifetime locks
      isLifetime: true,
    };
  },

  async getUsage(identity: RateLimitIdentity): Promise<RateLimitResult> {
    const ipHash = identity.ip ? hashIp(identity.ip) : undefined;
    const tier = await tierResolverService.resolveTier(identity.userId);
    const { dailyLimit, windowMs, isLifetime } = getLimitForTier(tier);

    const count = await auditLogService.countScansInWindow({
      userId: identity.userId,
      deviceFingerprint: identity.deviceFingerprint,
      ipHash,
      windowMs: isLifetime || tier === "guest" ? null : windowMs,
    });

    return {
      allowed: count < dailyLimit,
      limit: dailyLimit,
      count,
      remaining: Math.max(0, dailyLimit - count),
      tier,
      resetAt: null,
      isLifetime: true,
    };
  },
};
