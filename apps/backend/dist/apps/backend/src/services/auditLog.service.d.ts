import { auditLogs } from "../db/schema.js";
export type AuditAction = "scan" | "report" | "login" | "logout" | "signup";
export interface LogAuditEventParams {
    action: AuditAction;
    userId?: string;
    deviceFingerprint?: string;
    ipHash?: string;
    metadata?: Record<string, unknown>;
}
export interface CountScansParams {
    userId?: string;
    deviceFingerprint?: string;
    ipHash?: string;
    windowMs: number;
}
export declare const auditLogService: {
    /**
     * Write a single audit event.
     * Non-blocking — errors are logged but never propagated.
     * Rate limiting and scan flow must not fail due to a logging issue.
     */
    log(params: LogAuditEventParams): Promise<void>;
    /**
     * Count scan events within the rolling window for a given identity.
     * Identity resolution order: userId → deviceFingerprint → ipHash.
     * The most specific identity available is used.
     */
    countScansInWindow(params: CountScansParams): Promise<number>;
    /**
     * Fetch recent audit events for a user — used in security screens.
     */
    getRecentEvents(userId: string, limit?: number): Promise<(typeof auditLogs.$inferSelect)[]>;
};
//# sourceMappingURL=auditLog.service.d.ts.map