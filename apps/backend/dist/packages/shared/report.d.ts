export interface ReportRequest {
    scannedText: string;
    scamType?: string;
    userConfirmedScamType?: string;
    comment?: string;
    riskScore?: number;
    indicatorsDetected?: string[];
}
export interface ReportResponse {
    success: boolean;
    reportId: string;
    message: string;
}
export type ReportCategory = "advance_fee" | "fake_job" | "impersonation" | "phishing" | "investment_fraud" | "lottery" | "romance" | "delivery" | "loan" | "sim_swap" | "other";
export declare const REPORT_CATEGORIES: Record<ReportCategory, string>;
//# sourceMappingURL=report.d.ts.map