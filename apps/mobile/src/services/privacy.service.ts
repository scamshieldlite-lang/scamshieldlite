// apps/mobile/src/services/privacy.service.ts

import { apiClient } from "./api.service";
import type {
  PrivacySettingsResponse,
  UpdatePrivacySettingsRequest,
  PrivacySettingsData,
} from "@scamshieldlite/shared/";
import { File, Paths } from "expo-file-system";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { tokenStore } from "./tokenStore";

export const privacyService = {
  async getSettings(): Promise<PrivacySettingsResponse> {
    const { data } =
      await apiClient.get<PrivacySettingsResponse>("/privacy/settings");
    return data;
  },

  async updateSettings(
    updates: UpdatePrivacySettingsRequest,
  ): Promise<PrivacySettingsData> {
    const { data } = await apiClient.patch<{
      settings: PrivacySettingsData;
    }>("/privacy/settings", updates);
    return data.settings;
  },

  async recordConsent(): Promise<void> {
    await apiClient.post("/privacy/consent");
  },

  async exportData(): Promise<void> {
    const token = tokenStore.get();
    if (!token) throw new Error("Not authenticated");

    // Fetch the data
    const { data } = await apiClient.get("/privacy/export");

    // Format as human-readable text instead of raw JSON
    // Users understand this better than a JSON blob
    const content = formatExportData(data);

    const fileName = `scamshieldlite-data-${new Date()
      .toISOString()
      .slice(0, 10)}.txt`;

    // Use the older FileSystem API which is more stable
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    // Write file — must await this
    await FileSystem.writeAsStringAsync(fileUri, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Verify file was written correctly
    const info = await FileSystem.getInfoAsync(fileUri);
    if (!info.exists || info.size === 0) {
      throw new Error("File could not be created. Please try again.");
    }

    // Share
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "text/plain",
        dialogTitle: "Save your ScamShieldLite data",
        UTI: "public.plain-text",
      });
    } else {
      throw new Error("Sharing is not available on this device");
    }

    // Clean up temp file after sharing
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
  },

  async deleteScanHistory(): Promise<{
    deletedCount: number;
    message: string;
  }> {
    const { data } = await apiClient.delete<{
      success: boolean;
      deletedCount: number;
      message: string;
    }>("/privacy/scan-history");
    return data;
  },

  async deleteAccount(): Promise<void> {
    await apiClient.delete("/privacy/account");
  },
};

// Helper function to format export data as human-readable text
function formatExportData(data: any): string {
  const lines: string[] = [];
  const divider = "─".repeat(50);

  lines.push("SCAMSHIELDLITE — YOUR DATA EXPORT");
  lines.push(divider);
  lines.push(
    `Exported on: ${new Date().toLocaleDateString("en-NG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
  );
  lines.push("");

  // Account info
  lines.push("ACCOUNT");
  lines.push(divider);
  lines.push(`User ID: ${data.userId ?? "N/A"}`);
  lines.push("");

  // Subscription
  if (data.subscription) {
    lines.push("SUBSCRIPTION");
    lines.push(divider);
    lines.push(`Plan status: ${data.subscription.status ?? "N/A"}`);
    lines.push(
      `Trial started: ${
        data.subscription.trialStart
          ? new Date(data.subscription.trialStart).toLocaleDateString("en-NG")
          : "N/A"
      }`,
    );
    lines.push(
      `Trial ends: ${
        data.subscription.trialEnd
          ? new Date(data.subscription.trialEnd).toLocaleDateString("en-NG")
          : "N/A"
      }`,
    );
    lines.push("");
  }

  // Privacy settings
  if (data.privacySettings) {
    lines.push("PRIVACY SETTINGS");
    lines.push(divider);
    lines.push(
      `Save scan history: ${data.privacySettings.scanHistoryEnabled ? "Yes" : "No"}`,
    );
    lines.push(
      `Usage analytics: ${data.privacySettings.analyticsEnabled ? "Yes" : "No"}`,
    );
    lines.push(
      `Crash reporting: ${data.privacySettings.crashReportingEnabled ? "Yes" : "No"}`,
    );
    lines.push("");
  }

  // Consent history
  if (data.consentHistory?.length > 0) {
    lines.push("CONSENT HISTORY");
    lines.push(divider);
    data.consentHistory.forEach((c: any, i: number) => {
      lines.push(`Consent ${i + 1}:`);
      lines.push(`  Terms version: ${c.termsVersion}`);
      lines.push(`  Privacy version: ${c.privacyVersion}`);
      lines.push(
        `  Accepted on: ${new Date(c.createdAt).toLocaleDateString("en-NG")}`,
      );
    });
    lines.push("");
  }

  // Scan history
  if (data.scans?.length > 0) {
    lines.push(`SCAN HISTORY (${data.scans.length} scans)`);
    lines.push(divider);
    data.scans.forEach((scan: any, i: number) => {
      lines.push(
        `Scan ${i + 1} — ${new Date(scan.createdAt).toLocaleDateString("en-NG")}`,
      );
      lines.push(`  Risk level: ${scan.riskLevel}`);
      lines.push(`  Risk score: ${scan.riskScore}/100`);
      if (scan.scamType) lines.push(`  Scam type: ${scan.scamType}`);
      lines.push(`  Input type: ${scan.inputType}`);
      lines.push("");
    });
  } else {
    lines.push("SCAN HISTORY");
    lines.push(divider);
    lines.push("No scans recorded.");
    lines.push("");
  }

  // Reports
  if (data.reports?.length > 0) {
    lines.push(`REPORTED SCAMS (${data.reports.length} reports)`);
    lines.push(divider);
    data.reports.forEach((r: any, i: number) => {
      lines.push(
        `Report ${i + 1} — ${new Date(r.createdAt).toLocaleDateString("en-NG")}`,
      );
      if (r.scamType) lines.push(`  Scam type: ${r.scamType}`);
      lines.push(`  Risk score: ${r.riskScore}/100`);
      lines.push("");
    });
  }

  lines.push(divider);
  lines.push("This file contains all data ScamShieldLite holds about you.");
  lines.push("Personal information in scanned messages was automatically");
  lines.push("removed before storage. Raw message text is never stored.");
  lines.push(divider);

  return lines.join("\n");
}
