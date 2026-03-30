// apps/backend/src/services/retention.service.ts

import { db } from "@/db";
import { auditLogs, scans, reportedScams, session } from "@/db/schema";
import { lt, and, isNull, sql } from "drizzle-orm";
import { logger } from "@/utils/logger";

// Retention windows
const RETENTION = {
  AUDIT_LOGS_DAYS: 30,
  SCAN_HISTORY_DAYS: 365, // 1 year for registered users
  REPORTED_SCAMS_DAYS: 90, // 90 days then anonymised
  SESSIONS_DAYS: 30,
} as const;

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export const retentionService = {
  /**
   * Run all retention cleanup jobs.
   * Called by the scheduler — safe to run multiple times.
   */
  async runAll(): Promise<RetentionReport> {
    logger.info("Starting retention cleanup run");

    const [
      auditLogsDeleted,
      scanHistoryDeleted,
      reportedScamsAnonymised,
      sessionsDeleted,
    ] = await Promise.allSettled([
      this.purgeAuditLogs(),
      this.purgeOldScanHistory(),
      this.anonymiseOldReports(),
      this.purgeExpiredSessions(),
    ]);

    const report: RetentionReport = {
      runAt: new Date().toISOString(),
      auditLogs: this.extractCount(auditLogsDeleted),
      scanHistory: this.extractCount(scanHistoryDeleted),
      reportedScams: this.extractCount(reportedScamsAnonymised),
      sessions: this.extractCount(sessionsDeleted),
    };

    logger.info(report, "Retention cleanup complete");
    return report;
  },

  async purgeAuditLogs(): Promise<number> {
    // 1. Define the cutoff date using your existing helper
    const cutoff = daysAgo(RETENTION.AUDIT_LOGS_DAYS);

    let totalDeleted = 0;
    let currentBatchSize = 0;

    try {
      do {
        // 2. Run the batch delete using SQL template literal from 'drizzle-orm'
        const result = await db.execute(sql`
        DELETE FROM audit_logs 
        WHERE id IN (
          SELECT id FROM audit_logs 
          WHERE created_at < ${cutoff} 
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
    } catch (error) {
      logger.error({ error }, "Batch purge of audit logs failed");
      throw error;
    }
  },

  async purgeOldScanHistory(): Promise<number> {
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
  async anonymiseOldReports(): Promise<number> {
    const cutoff = daysAgo(RETENTION.REPORTED_SCAMS_DAYS);

    const result = await db
      .update(reportedScams)
      .set({
        userId: null,
        deviceFingerprint: null,
      })
      .where(
        and(
          lt(reportedScams.createdAt, cutoff),
          // Only anonymise rows that still have identity fields
        ),
      )
      .returning({ id: reportedScams.id });

    logger.info({ count: result.length, cutoff }, "Old reports anonymised");
    return result.length;
  },

  async purgeExpiredSessions(): Promise<number> {
    const cutoff = daysAgo(RETENTION.SESSIONS_DAYS);
    const result = await db
      .delete(session)
      .where(lt(session.expiresAt, cutoff))
      .returning({ id: session.id });

    logger.info({ count: result.length, cutoff }, "Expired sessions purged");
    return result.length;
  },

  extractCount(result: PromiseSettledResult<number>): number {
    if (result.status === "fulfilled") return result.value;
    logger.error({ reason: result.reason }, "Retention job failed");
    return 0;
  },
};

export interface RetentionReport {
  runAt: string;
  auditLogs: number;
  scanHistory: number;
  reportedScams: number;
  sessions: number;
}
