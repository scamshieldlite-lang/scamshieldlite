import { useState, useCallback } from "react";
import { reportService } from "@/services/report.service";
import type { ReportRequest, ReportCategory } from "@scamshieldlite/shared/";
import type { ScanResponse } from "@scamshieldlite/shared/";
import { extractErrorMessage } from "@/utils/errorMessage";

type ReportState = "idle" | "loading" | "success" | "error";

interface UseReportReturn {
  state: ReportState;
  reportId: string | null;
  message: string | null;
  error: string | null;
  submit: (
    scanResult: ScanResponse,
    originalText: string,
    category: ReportCategory,
    comment?: string,
  ) => Promise<void>;
  reset: () => void;
}

export function useReport(): UseReportReturn {
  const [state, setState] = useState<ReportState>("idle");
  const [reportId, setReportId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (
      scanResult: ScanResponse,
      originalText: string,
      category: ReportCategory,
      comment?: string,
    ) => {
      setState("loading");
      setError(null);

      try {
        const payload: ReportRequest = {
          scannedText: originalText, // ← now uses real text, not explanation
          scamType: scanResult.result.scam_type,
          userConfirmedScamType: category,
          comment,
          riskScore: scanResult.result.risk_score,
          indicatorsDetected: scanResult.result.indicators_detected,
        };

        const response = await reportService.submit(payload);

        setReportId(response.reportId);
        setMessage(response.message);
        setState("success");
      } catch (err) {
        setState("error");
        setError(extractErrorMessage(err));
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setState("idle");
    setReportId(null);
    setMessage(null);
    setError(null);
  }, []);

  return { state, reportId, message, error, submit, reset };
}
