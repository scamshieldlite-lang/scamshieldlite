export declare const CURRENT_TERMS_VERSION = "1.0";
export declare const CURRENT_PRIVACY_VERSION = "1.0";
export declare const consentService: {
    /**
     * Record consent at signup or when policies update.
     */
    recordConsent(userId: string, ip?: string, userAgent?: string): Promise<void>;
    /**
     * Check if user has consented to the current policy versions.
     */
    hasCurrentConsent(userId: string): Promise<boolean>;
    /**
     * Get the most recent consent record for a user.
     */
    getLatestConsent(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userAgent: string | null;
        userId: string;
        ipHash: string | null;
        termsVersion: string;
        privacyVersion: string;
    } | undefined>;
    /**
     * Get or create privacy settings for a user.
     * Returns defaults if no row exists yet.
     */
    getPrivacySettings(userId: string): Promise<{
        updatedAt: Date;
        userId: string;
        analyticsEnabled: boolean;
        scanHistoryEnabled: boolean;
        crashReportingEnabled: boolean;
    }>;
    /**
     * Update privacy settings for a user.
     */
    updatePrivacySettings(userId: string, updates: Partial<{
        analyticsEnabled: boolean;
        scanHistoryEnabled: boolean;
        crashReportingEnabled: boolean;
    }>): Promise<void>;
};
//# sourceMappingURL=consent.service.d.ts.map