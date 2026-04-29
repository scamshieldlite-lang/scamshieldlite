// apps/backend/src/services/retention.service.ts
import { db } from "../db/index.js";
import { scans, reportedScams, session } from "../db/schema.js";
import { lt, and, sql } from "drizzle-orm";
import { logger } from "../utils/logger.js";
// Retention windows
const RETENTION = {
    AUDIT_LOGS_DAYS: 30,
    SCAN_HISTORY_DAYS: 365, // 1 year for registered users
    REPORTED_SCAMS_DAYS: 90, // 90 days then anonymised
    SESSIONS_DAYS: 30,
};
function daysAgo(days) {
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}
export const retentionService = {
    /**
     * Run all retention cleanup jobs.
     * Called by the scheduler — safe to run multiple times.
     */
    async runAll() {
        logger.info("Starting retention cleanup run");
        const [auditLogsDeleted, scanHistoryDeleted, reportedScamsAnonymised, sessionsDeleted,] = await Promise.allSettled([
            this.purgeAuditLogs(),
            this.purgeOldScanHistory(),
            this.anonymiseOldReports(),
            this.purgeExpiredSessions(),
        ]);
        const report = {
            runAt: new Date().toISOString(),
            auditLogs: this.extractCount(auditLogsDeleted),
            scanHistory: this.extractCount(scanHistoryDeleted),
            reportedScams: this.extractCount(reportedScamsAnonymised),
            sessions: this.extractCount(sessionsDeleted),
        };
        logger.info(report, "Retention cleanup complete");
        return report;
    },
    async purgeAuditLogs() {
        // 1. Define the cutoff date using your existing helper
        const cutoff = daysAgo(RETENTION.AUDIT_LOGS_DAYS);
        let totalDeleted = 0;
        let currentBatchSize = 0;
        try {
            do {
                // 2. Run the batch delete using SQL template literal from 'drizzle-orm'
                const result = await db.execute(sql `
        DELETE FROM audit_logs 
        WHERE id IN (
          SELECT id FROM audit_logs 
          WHERE created_at < ${cutoff.toISOString()} 
          LIMIT 1000
        )
      `);
                // In Drizzle's db.execute, check the result length
                currentBatchSize = result.count;
                totalDeleted += currentBatchSize;
                logger.debug({ batchSize: currentBatchSize }, "Audit log batch purged");
            } while (currentBatchSize >= 1000); // Keep going if we hit the limit
            logger.info({ totalDeleted, cutoff }, "Audit logs purge complete");
            return totalDeleted;
        }
        catch (error) {
            logger.error({ error }, "Batch purge of audit logs failed");
            throw error;
        }
    },
    async purgeOldScanHistory() {
        const cutoff = daysAgo(RETENTION.SCAN_HISTORY_DAYS);
        const result = await db
            .delete(scans)
            .where(lt(scans.createdAt, cutoff))
            .returning({ id: scans.id });
        logger.info({ count: result.length, cutoff }, "Old scan history purged");
        return result.length;
    },
    /**
     * Anonymise old reported scams rather than delete —
     * the scam pattern data is still useful for detection
     * but the identity fields should be cleared.
     */
    async anonymiseOldReports() {
        const cutoff = daysAgo(RETENTION.REPORTED_SCAMS_DAYS);
        const result = await db
            .update(reportedScams)
            .set({
            userId: null,
            deviceFingerprint: null,
        })
            .where(and(lt(reportedScams.createdAt, cutoff)))
            .returning({ id: reportedScams.id });
        logger.info({ count: result.length, cutoff }, "Old reports anonymised");
        return result.length;
    },
    async purgeExpiredSessions() {
        const cutoff = daysAgo(RETENTION.SESSIONS_DAYS);
        const result = await db
            .delete(session)
            .where(lt(session.expiresAt, cutoff))
            .returning({ id: session.id });
        logger.info({ count: result.length, cutoff }, "Expired sessions purged");
        return result.length;
    },
    extractCount(result) {
        if (result.status === "fulfilled")
            return result.value;
        logger.error({ reason: result.reason }, "Retention job failed");
        return 0;
    },
};
//# sourceMappingURL=retention.service.js.map