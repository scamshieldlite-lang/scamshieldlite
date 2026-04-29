export type UserTier = "guest" | "trialing" | "paid" | "expired";
export interface RateLimitConfig {
    dailyLimit: number;
    windowMs: number;
}
export declare const RATE_LIMIT_CONFIG: Record<UserTier, RateLimitConfig>;
export declare function getLimitForTier(tier: UserTier): RateLimitConfig;
//# sourceMappingURL=rateLimits.d.ts.map