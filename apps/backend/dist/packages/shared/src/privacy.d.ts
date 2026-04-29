export interface PrivacySettingsData {
    analyticsEnabled: boolean;
    scanHistoryEnabled: boolean;
    crashReportingEnabled: boolean;
    updatedAt: string;
}
export interface ConsentSummary {
    termsVersion: string;
    privacyVersion: string;
    acceptedAt: string;
}
export interface PrivacySettingsResponse {
    settings: PrivacySettingsData;
    consent: ConsentSummary | null;
    currentVersions: {
        terms: string;
        privacy: string;
    };
}
export interface UpdatePrivacySettingsRequest {
    analyticsEnabled?: boolean;
    scanHistoryEnabled?: boolean;
    crashReportingEnabled?: boolean;
}
export declare const LEGAL_VERSIONS: {
    readonly TERMS: "1.0";
    readonly PRIVACY: "1.0";
};
//# sourceMappingURL=privacy.d.ts.map