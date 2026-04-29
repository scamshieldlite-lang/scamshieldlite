// apps/backend/src/services/consent.service.ts
import { db } from "../db/index.js";
import { consentRecords, privacySettings } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { hashIp } from "../utils/hash.js";
import { logger } from "../utils/logger.js";
// Bump these versions when policy documents change.
// Any user who consented to an older version will be
// prompted to re-accept on next login.
export const CURRENT_TERMS_VERSION = "1.0";
export const CURRENT_PRIVACY_VERSION = "1.0";
export const consentService = {
    /**
     * Record consent at signup or when policies update.
     */
    async recordConsent(userId, ip, userAgent) {
        await db.insert(consentRecords).values({
            userId,
            termsVersion: CURRENT_TERMS_VERSION,
            privacyVersion: CURRENT_PRIVACY_VERSION,
            ipHash: ip ? hashIp(ip) : null,
            userAgent: userAgent ?? null,
        });
        logger.info({
            userId,
            termsVersion: CURRENT_TERMS_VERSION,
            privacyVersion: CURRENT_PRIVACY_VERSION,
        }, "Consent recorded");
    },
    /**
     * Check if user has consented to the current policy versions.
     */
    async hasCurrentConsent(userId) {
        const latest = await db.query.consentRecords.findFirst({
            where: eq(consentRecords.userId, userId),
            orderBy: [desc(consentRecords.createdAt)],
        });
        if (!latest)
            return false;
        return (latest.termsVersion === CURRENT_TERMS_VERSION &&
            latest.privacyVersion === CURRENT_PRIVACY_VERSION);
    },
    /**
     * Get the most recent consent record for a user.
     */
    async getLatestConsent(userId) {
        return db.query.consentRecords.findFirst({
            where: eq(consentRecords.userId, userId),
            orderBy: [desc(consentRecords.createdAt)],
        });
    },
    /**
     * Get or create privacy settings for a user.
     * Returns defaults if no row exists yet.
     */
    async getPrivacySettings(userId) {
        const existing = await db.query.privacySettings.findFirst({
            where: eq(privacySettings.userId, userId),
        });
        if (existing)
            return existing;
        // Create default settings row
        const [created] = await db
            .insert(privacySettings)
            .values({
            userId,
            analyticsEnabled: true,
            scanHistoryEnabled: true,
            crashReportingEnabled: true,
        })
            .returning();
        return created;
    },
    /**
     * Update privacy settings for a user.
     */
    async updatePrivacySettings(userId, updates) {
        await db
            .insert(privacySettings)
            .values({
            userId,
            ...updates,
            updatedAt: new Date(),
        })
            .onConflictDoUpdate({
            target: privacySettings.userId,
            set: {
                ...updates,
                updatedAt: new Date(),
            },
        });
        logger.info({ userId, updates }, "Privacy settings updated");
    },
};
//# sourceMappingURL=consent.service.js.map