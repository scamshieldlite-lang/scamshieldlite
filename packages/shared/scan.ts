// packages/shared/scan.ts

export type RiskLevel = "Likely Safe" | "Suspicious" | "Likely Scam";
export type InputType = "text" | "screenshot";
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "expired"
  | "cancelled";

export interface ScanResult {
  risk_score: number; // 0–100
  risk_level: RiskLevel;
  scam_type: string;
  indicators_detected: string[];
  explanation: string;
  recommendation: string;
}

export interface ScanRequest {
  text: string;
  userId?: string; // optional for guests
  inputType: InputType;
  deviceFingerprint: string;
}

export interface ScanResponse {
  result: ScanResult;
  scanId?: string; // only for logged-in users
  scansRemaining?: number; // guest feedback
  limitReached?: boolean;
  subscriptionStatus?: SubscriptionStatus;
}

export interface ApiError {
  error: string;
  code: "RATE_LIMITED" | "UNAUTHORIZED" | "INVALID_INPUT" | "SERVER_ERROR";
  scansRemaining?: number; // included on RATE_LIMITED so client can show feedback
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
  resetAt: string; // ISO string
  tier: string;
}

export type UserTier = "guest" | "trialing" | "paid" | "expired";
