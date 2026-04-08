import { apiClient } from "./api.service";
import type {
  ScanRequest,
  ScanResponse,
  UsageSummary,
} from "@scamshieldlite/shared/";
import type { RiskLevel } from "@scamshieldlite/shared/";

// Shape returned by GET /api/scan/history
interface RawHistoryItem {
  id: string;
  riskScore: number;
  riskLevel: RiskLevel;
  scamType: string;
  indicatorsDetected: string[];
  explanation: string;
  recommendation: string;
  createdAt: string;
}

export interface NormalizedHistoryItem {
  id: string;
  createdAt: string;
  result: {
    risk_score: number;
    risk_level: RiskLevel;
    scam_type: string;
    indicators_detected: string[];
    explanation: string;
    recommendation: string;
  };
}

export const scanService = {
  async analyze(text: string): Promise<ScanResponse> {
    const { data } = await apiClient.post<ScanResponse>("/scan", {
      text,
      inputType: "text",
    } satisfies Omit<ScanRequest, "deviceFingerprint">);
    return data;
  },

  async getUsage(): Promise<UsageSummary> {
    const { data } = await apiClient.get<UsageSummary>("/scan/usage");
    return data;
  },

  async getHistory(): Promise<{ history: NormalizedHistoryItem[] }> {
    const { data } = await apiClient.get<{ history: RawHistoryItem[] }>(
      "/scan/history",
    );

    // Normalize DB column naming (camelCase) → shared type (snake_case)
    const history: NormalizedHistoryItem[] = data.history.map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      result: {
        risk_score: item.riskScore,
        risk_level: item.riskLevel,
        scam_type: item.scamType,
        indicators_detected: item.indicatorsDetected,
        explanation: item.explanation,
        recommendation: item.recommendation,
      },
    }));

    return { history };
  },
};
