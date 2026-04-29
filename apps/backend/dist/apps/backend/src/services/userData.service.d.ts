export declare const userDataService: {
    /**
     * Export all data held for a user.
     * Returns a JSON-serialisable object — caller converts to file.
     *
     * Note: scrubbedInput fields are included because the user
     * has a right to see what was stored about them, even though
     * the original raw text was never stored.
     */
    exportUserData(userId: string): Promise<{
        exportedAt: string;
        userId: string;
        scans: {
            id: string;
            createdAt: Date;
            inputType: "text" | "screenshot";
            inputLength: number;
            riskScore: number;
            riskLevel: "Likely Safe" | "Suspicious" | "Likely Scam";
            scamType: string | null;
            indicatorsDetected: unknown;
            explanation: string;
            recommendation: string;
        }[];
        reports: {
            id: string;
            createdAt: Date;
            riskScore: number;
            scamType: string | null;
            indicatorsDetected: unknown;
        }[];
        subscription: {
            createdAt: Date;
            status: "trialing" | "active" | "expired" | "cancelled";
            planId: string | null;
            trialStart: Date;
            trialEnd: Date;
            currentPeriodEnd: Date | null;
        } | null;
        consentHistory: {
            createdAt: Date;
            termsVersion: string;
            privacyVersion: string;
        }[];
        privacySettings: {
            updatedAt: Date;
            userId: string;
            analyticsEnabled: boolean;
            scanHistoryEnabled: boolean;
            crashReportingEnabled: boolean;
        } | null;
    }>;
    /**
     * Delete all user data.
     *
     * Order matters — child records first, then the user row.
     * Better Auth's cascade deletes handle session + account rows.
     */
    deleteUserData(userId: string): Promise<void>;
    /**
     * Delete only the scan history for a user.
     * Keeps the account and subscription intact.
     */
    deleteScanHistory(userId: string): Promise<number>;
};
//# sourceMappingURL=userData.service.d.ts.map