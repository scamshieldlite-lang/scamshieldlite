import { useState, useCallback } from "react";
import { scanService } from "@/services/scan.service";
import type { ScanResponse } from "@scamshieldlite/shared/";

interface HistoryItem extends ScanResponse {
  id: string;
  createdAt: string;
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
    } catch {
      setError("Failed to load scan history. Pull down to retry.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const fetch = useCallback(() => load(false), [load]);
  const refresh = useCallback(() => load(true), [load]);

  return { items, isLoading, isRefreshing, error, fetch, refresh };
}
