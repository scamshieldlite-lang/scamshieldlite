// packages/types/src/index.ts

// AI scan result — backend returns this, mobile consumes it
export interface ScanResult {
  id: string;
  riskScore: number; // 0–100
  riskLevel: "Safe" | "Medium Risk" | "High Risk";
  scamType: string | null;
  indicatorsDetected: string[];
  explanation: string;
  recommendation: string;
  aiProvider: string;
  createdAt: string;
}

// What the mobile app sends to the backend
export interface ScanRequest {
  inputType: "text" | "screenshot";
  content: string; // raw text or OCR-extracted text
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
