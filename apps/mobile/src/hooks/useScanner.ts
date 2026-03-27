// apps/mobile/src/hooks/useScanner.ts

import { useState, useCallback } from "react";
import { scanService } from "@/services/scan.service";
import { useScanUsage } from "./useScanUsage";
import type { ScanResponse } from "@scamshieldlite/shared/";
import type { AxiosError } from "axios";
import type { ApiError } from "@scamshieldlite/shared/";

interface UseScannerReturn {
  scan: (text: string) => Promise<ScanResponse | null>;
  isLoading: boolean;
  error: string | null;
  isRateLimited: boolean;
  clearError: () => void;
}

export function useScanner(): UseScannerReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const { decrementOptimistic, refresh } = useScanUsage();

  const scan = useCallback(
    async (text: string): Promise<ScanResponse | null> => {
      setIsLoading(true);
      setError(null);
      setIsRateLimited(false);

      try {
        decrementOptimistic();
        const result = await scanService.analyze(text, "text");
        // Sync actual usage after successful scan
        await refresh();
        return result;
      } catch (err) {
        const axiosError = err as AxiosError<ApiError>;
        const code = axiosError.response?.data?.code;
        const message = axiosError.response?.data?.error;
        await refresh();

        if (code === "RATE_LIMITED") {
          setIsRateLimited(true);
          setError(message ?? "Daily scan limit reached");
          // Re-sync usage so counter reflects real state
          await refresh();
        } else if (code === "INVALID_INPUT") {
          setError(message ?? "Invalid message text");
        } else {
          setError("Something went wrong. Please try again.");
        }

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [decrementOptimistic, refresh],
  );

  const clearError = useCallback(() => {
    setError(null);
    setIsRateLimited(false);
  }, []);

  return { scan, isLoading, error, isRateLimited, clearError };
}
