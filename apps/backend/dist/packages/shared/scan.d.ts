export type RiskLevel = "Likely Safe" | "Suspicious" | "Likely Scam";
export type InputType = "text" | "screenshot";
export type SubscriptionStatus = "trialing" | "active" | "expired" | "cancelled";
export interface ScanResult {
    risk_score: number;
    risk_level: RiskLevel;
    scam_type: string;
    indicators_detected: string[];
    explanation: string;
    recommendation: string;
}
export interface ScanRequest {
    text: string;
    userId?: string;
    inputType: InputType;
    deviceFingerprint: string;
}
export interface ScanResponse {
    result: ScanResult;
    scanId?: string;
    scansRemaining?: number;
    limitReached?: boolean;
    subscriptionStatus?: SubscriptionStatus;
}
export interface ApiError {
    error: string;
    code: "RATE_LIMITED" | "UNAUTHORIZED" | "INVALID_INPUT" | "SERVER_ERROR";
    scansRemaining?: number;
}
export interface UsageSummary {
    scansToday: number;
    scanLimit: number;
    scansRemaining: number;
    isGuest: boolean;
}
export interface RateLimitHeaders {
    limit: number;
    remaining: number;
    resetAt: string;
    tier: string;
}
export type UserTier = "guest" | "trialing" | "paid" | "expired";
//# sourceMappingURL=scan.d.ts.map