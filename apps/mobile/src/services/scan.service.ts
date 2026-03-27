import { apiClient } from "./api.service";
import type {
  ScanRequest,
  ScanResponse,
  UsageSummary,
  InputType,
} from "@scamshieldlite/shared/";

export const scanService = {
  async analyze(text: string, inputType: InputType): Promise<ScanResponse> {
    const { data } = await apiClient.post<ScanResponse>("/scan", {
      text,
      inputType,
    } satisfies Omit<ScanRequest, "deviceFingerprint">);
    // deviceFingerprint is injected via request interceptor header
    return data;
  },

  async getUsage(): Promise<UsageSummary> {
    const { data } = await apiClient.get<UsageSummary>("/scan/usage");
    return data;
  },

  async getHistory(): Promise<{ history: ScanResponse[] }> {
    const { data } = await apiClient.get<{ history: ScanResponse[] }>(
      "/scan/history",
    );
    return data;
  },
};
