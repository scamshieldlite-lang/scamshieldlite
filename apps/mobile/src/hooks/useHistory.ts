import { useState, useCallback, useEffect } from "react";
import { scanService } from "@/services/scan.service";
import { useAuth } from "@/hooks/useAuth";
import type { RiskLevel } from "@scamshieldlite/shared/";

interface HistoryItem {
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

interface UseHistoryReturn {
  items: HistoryItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useHistory(): UseHistoryReturn {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { authState } = useAuth();

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const { history } = await scanService.getHistory();
      setItems(history as unknown as HistoryItem[]);
    } catch (err: any) {
      // Don't show error for 401 — AuthGuard handles that state
      if (err?.response?.status !== 401) {
        setError("Failed to load scan history. Pull down to retry.");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const fetchHistory = useCallback(() => load(false), [load]);
  const refresh = useCallback(() => load(true), [load]);

  // Re-fetch when auth state changes to authenticated
  useEffect(() => {
    if (authState === "authenticated") {
      fetchHistory();
    } else {
      // Clear history when logging out
      setItems([]);
      setError(null);
    }
  }, [authState]); // react to auth changes

  return {
    items,
    isLoading,
    isRefreshing,
    error,
    fetch: fetchHistory,
    refresh,
  };
}
