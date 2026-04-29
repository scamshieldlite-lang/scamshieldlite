import type { UserTier } from "../config/rateLimits.js";
export declare const tierResolverService: {
    /**
     * Resolve the rate limit tier for a given request context.
     *
     * Guest    → no userId
     * Trialing → userId + active trial subscription
     * Paid     → userId + active paid subscription
     * Expired  → userId + expired/cancelled subscription
     */
    resolveTier(userId?: string): Promise<UserTier>;
};
//# sourceMappingURL=tierResolver.service.d.ts.map