// apps/backend/src/services/auditLog.service.ts

import { db } from "@/db/index.js";
import { auditLogs } from "@/db/schema.js";
import { and, eq, gte, sql } from "drizzle-orm";
import { logger } from "@/utils/logger.js";

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
  windowMs: number | null; // null means count all scans ever (lifetime limit)
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

    // Build query differently based on whether this is lifetime or windowed
    if (params.windowMs === null) {
      // LIFETIME — count ALL scans ever for this identity, no time filter
      const result = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(auditLogs)
        .where(and(identityCondition, eq(auditLogs.action, "scan")));

      const count = result[0]?.count ?? 0;
      logger.debug(
        {
          userId: params.userId,
          deviceFingerprint: params.deviceFingerprint?.substring(0, 12),
          count,
          type: "lifetime",
        },
        "Lifetime scan count",
      );
      return count;
    }

    // WINDOWED — count scans within rolling time window
    const windowStart = new Date(Date.now() - params.windowMs);

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

    const count = result[0]?.count ?? 0;
    logger.debug(
      {
        userId: params.userId,
        deviceFingerprint: params.deviceFingerprint?.substring(0, 12),
        count,
        windowStart,
        type: "windowed",
      },
      "Windowed scan count",
    );
    return count;
  },

  /**
   * Fetch recent audit events for a user — used in security screens.
   */
  async getRecentEvents(
    userId: string,
    limit = 20,
  ): Promise<(typeof auditLogs.$inferSelect)[]> {
    return db.query.auditLogs.findMany({
      where: (log, { eq }) => eq(log.userId, userId),
      orderBy: (log, { desc }) => [desc(log.createdAt)],
      limit,
    });
  },
};
