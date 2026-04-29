import { db } from "@/db/index.js";
import {
  scans,
  reportedScams,
  auditLogs,
  subscriptions,
  consentRecords,
  privacySettings,
  devices,
} from "@/db/schema.js";
import { eq } from "drizzle-orm";
import { logger } from "@/utils/logger.js";
import { auth } from "@/lib/auth.js";

export const userDataService = {
  /**
   * Export all data held for a user.
   * Returns a JSON-serialisable object — caller converts to file.
   *
   * Note: scrubbedInput fields are included because the user
   * has a right to see what was stored about them, even though
   * the original raw text was never stored.
   */
  async exportUserData(userId: string) {
    const [
      userScans,
      userReports,
      userSubscription,
      userConsent,
      userPrivacySettings,
    ] = await Promise.all([
      db.query.scans.findMany({
        where: eq(scans.userId, userId),
        columns: {
          id: true,
          inputType: true,
          inputLength: true,
          riskScore: true,
          riskLevel: true,
          scamType: true,
          indicatorsDetected: true,
          explanation: true,
          recommendation: true,
          createdAt: true,
          // Deliberately exclude scrubbedInput from export
          // — it contains the scrubbed message text
          scrubbedInput: false,
          aiProvider: false,
        },
      }),
      db.query.reportedScams.findMany({
        where: eq(reportedScams.userId, userId),
        columns: {
          id: true,
          scamType: true,
          riskScore: true,
          indicatorsDetected: true,
          createdAt: true,
          scrubbedInput: false,
        },
      }),
      db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, userId),
        columns: {
          status: true,
          planId: true,
          trialStart: true,
          trialEnd: true,
          currentPeriodEnd: true,
          createdAt: true,
          playPurchaseToken: false, // Never export billing tokens
        },
      }),
      db.query.consentRecords.findMany({
        where: eq(consentRecords.userId, userId),
        columns: {
          termsVersion: true,
          privacyVersion: true,
          createdAt: true,
          ipHash: false, // Don't export hashed IPs
        },
      }),
      db.query.privacySettings.findFirst({
        where: eq(privacySettings.userId, userId),
      }),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      userId,
      scans: userScans,
      reports: userReports,
      subscription: userSubscription ?? null,
      consentHistory: userConsent,
      privacySettings: userPrivacySettings ?? null,
    };
  },

  /**
   * Delete all user data.
   *
   * Order matters — child records first, then the user row.
   * Better Auth's cascade deletes handle session + account rows.
   */
  async deleteUserData(userId: string): Promise<void> {
    logger.info({ userId }, "Starting account deletion");

    // Delete our tables first (FK references to user.id)
    await db.delete(scans).where(eq(scans.userId, userId));

    await db
      .update(reportedScams)
      .set({ userId: null, deviceFingerprint: null })
      .where(eq(reportedScams.userId, userId));

    await db.delete(subscriptions).where(eq(subscriptions.userId, userId));

    await db.delete(devices).where(eq(devices.userId, userId));

    await db.delete(consentRecords).where(eq(consentRecords.userId, userId));

    await db.delete(privacySettings).where(eq(privacySettings.userId, userId));

    await db
      .update(auditLogs)
      .set({ userId: null })
      .where(eq(auditLogs.userId, userId));

    // Finally — delete the Better Auth user row
    // This cascades to session + account via FK
    await auth.api.deleteUser({
      headers: new Headers(), // If required by your middleware
      body: {
        userId: userId,
      },
    } as any);

    logger.info({ userId }, "Account deletion complete");
  },

  /**
   * Delete only the scan history for a user.
   * Keeps the account and subscription intact.
   */
  async deleteScanHistory(userId: string): Promise<number> {
    const result = await db
      .delete(scans)
      .where(eq(scans.userId, userId))
      .returning({ id: scans.id });

    logger.info({ userId, count: result.length }, "Scan history deleted");

    return result.length;
  },
};
