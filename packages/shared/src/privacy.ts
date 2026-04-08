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

// Legal document versions — bump when content changes
export const LEGAL_VERSIONS = {
  TERMS: "1.0",
  PRIVACY: "1.0",
} as const;
