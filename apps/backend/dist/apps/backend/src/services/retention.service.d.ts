export declare const retentionService: {
    /**
     * Run all retention cleanup jobs.
     * Called by the scheduler — safe to run multiple times.
     */
    runAll(): Promise<RetentionReport>;
    purgeAuditLogs(): Promise<number>;
    purgeOldScanHistory(): Promise<number>;
    /**
     * Anonymise old reported scams rather than delete —
     * the scam pattern data is still useful for detection
     * but the identity fields should be cleared.
     */
    anonymiseOldReports(): Promise<number>;
    purgeExpiredSessions(): Promise<number>;
    extractCount(result: PromiseSettledResult<number>): number;
};
export interface RetentionReport {
    runAt: string;
    auditLogs: number;
    scanHistory: number;
    reportedScams: number;
    sessions: number;
}
//# sourceMappingURL=retention.service.d.ts.map