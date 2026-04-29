// apps/backend/src/config/rateLimits.ts

import { env } from "@/utils/env.js";

export type UserTier = "guest" | "trialing" | "paid" | "expired";

export interface RateLimitConfig {
  dailyLimit: number;
  windowMs: number; // rolling window in milliseconds
}

// 24-hour rolling window
const WINDOW_MS = 24 * 60 * 60 * 1000;

export const RATE_LIMIT_CONFIG: Record<UserTier, RateLimitConfig> = {
  guest: {
    dailyLimit: env.GUEST_DAILY_SCAN_LIMIT,
    windowMs: WINDOW_MS,
  },
  trialing: {
    dailyLimit: env.TRIAL_DAILY_SCAN_LIMIT,
    windowMs: WINDOW_MS,
  },
  paid: {
    dailyLimit: env.REGISTERED_DAILY_SCAN_LIMIT,
    windowMs: WINDOW_MS,
  },
  expired: {
    // Expired subscribers fall back to guest-level limits
    dailyLimit: env.GUEST_DAILY_SCAN_LIMIT,
    windowMs: WINDOW_MS,
  },
};

export function getLimitForTier(tier: UserTier): RateLimitConfig {
  return RATE_LIMIT_CONFIG[tier];
}
