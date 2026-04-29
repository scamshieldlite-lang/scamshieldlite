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
    resetAt: Date;
}
export declare const rateLimitService: {
    /**
     * Check whether this identity is within their scan limit.
     * If allowed, log the attempt to audit_logs.
     *
     * This is the single entry point called by the rate limit middleware.
     */
    checkAndLog(identity: RateLimitIdentity): Promise<RateLimitResult>;
    /**
     * Get current usage without logging or blocking.
     * Used by the mobile app to show "X scans remaining" in the UI.
     */
    getUsage(identity: RateLimitIdentity): Promise<RateLimitResult>;
};
//# sourceMappingURL=rateLimit.service.d.ts.map