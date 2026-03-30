// apps/mobile/src/services/privacy.service.ts

import { apiClient } from "./api.service";
import type {
  PrivacySettingsResponse,
  UpdatePrivacySettingsRequest,
  PrivacySettingsData,
} from "@scamshieldlite/shared/";

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
    // Triggers a file download — handled by linking to URL
    const { data } = await apiClient.get("/privacy/export", {
      responseType: "blob",
    });
    // In React Native we can't trigger a file download directly
    // Instead we show the raw JSON in a modal or share it
    return data;
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
