export interface ReportRequest {
  scannedText: string; // Raw text — will be scrubbed on backend
  scamType?: string; // Pre-filled from scan result
  userConfirmedScamType?: string; // User can override/specify
  comment?: string; // Optional free-text from user (max 300 chars)
  riskScore?: number; // From original scan — stored for analytics
  indicatorsDetected?: string[];
}

export interface ReportResponse {
  success: boolean;
  reportId: string;
  message: string;
}

export type ReportCategory =
  | "advance_fee"
  | "fake_job"
  | "impersonation"
  | "phishing"
  | "investment_fraud"
  | "lottery"
  | "romance"
  | "delivery"
  | "loan"
  | "sim_swap"
  | "other";

export const REPORT_CATEGORIES: Record<ReportCategory, string> = {
  advance_fee: "Advance fee / 419",
  fake_job: "Fake job offer",
  impersonation: "Impersonation",
  phishing: "Phishing / fake link",
  investment_fraud: "Investment fraud",
  lottery: "Lottery / prize scam",
  romance: "Romance scam",
  delivery: "Fake delivery fee",
  loan: "Loan scam",
  sim_swap: "SIM swap / account takeover",
  other: "Other",
};
