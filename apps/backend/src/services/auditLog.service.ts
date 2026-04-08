// apps/backend/src/services/auditLog.service.ts

import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";
import { logger } from "@/utils/logger";

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

export const auditLogService = {
  /**
   * Write a single audit event.
   * Non-blocking — errors are logged but never propagated.
   * Rate limiting and scan flow must not fail due to a logging issue.
   */
  async log(params: LogAuditEventParams): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        action: params.action,
        userId: params.userId ?? null,
        deviceFingerprint: params.deviceFingerprint ?? null,
        ipHash: params.ipHash ?? null,
        metadata: params.metadata ?? {},
        createdAt: new Date(),
      });
    } catch (error) {
      // Intentionally non-fatal
      logger.error({ error, params }, "Failed to write audit log");
    }
  },

  /**
   * Count scan events within the rolling window for a given identity.
   * Identity resolution order: userId → deviceFingerprint → ipHash.
   * The most specific identity available is used.
   */
  async countScansInWindow(params: CountScansParams): Promise<number> {
    const windowStart = new Date(Date.now() - params.windowMs);

    // Build the WHERE clause based on whichever identity we have
    // Priority: userId > deviceFingerprint > ipHash
    const identityCondition = params.userId
      ? eq(auditLogs.userId, params.userId)
      : params.deviceFingerprint
        ? eq(auditLogs.deviceFingerprint, params.deviceFingerprint)
        : params.ipHash
          ? eq(auditLogs.ipHash, params.ipHash)
          : null;

    if (!identityCondition) {
      logger.warn("countScansInWindow called with no identity — returning 0");
      return 0;
    }

    const result = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(auditLogs)
      .where(
        and(
          identityCondition,
          eq(auditLogs.action, "scan"),
          gte(auditLogs.createdAt, windowStart),
        ),
      );

    return result[0]?.count ?? 0;
  },

  /**
   * Fetch recent audit events for a user — used in security screens.
   */
  async getRecentEvents(
    userId: string,
    limit = 20,
  ): Promise<(typeof auditLogs.$inferSelect)[]> {
    return db.query.auditLogs.findMany({
      where: eq(auditLogs.userId, userId),
      orderBy: (log, { desc }) => [desc(log.createdAt)],
      limit,
    });
  },
};
