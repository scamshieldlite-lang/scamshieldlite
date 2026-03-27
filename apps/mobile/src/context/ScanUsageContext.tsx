import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { scanService } from "@/services/scan.service";
import type { UsageSummary } from "@scamshieldlite/shared/";
import { logger } from "@/utils/logger";

interface ScanUsageContextValue {
  usage: UsageSummary | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  decrementOptimistic: () => void;
}

const DEFAULT_USAGE: UsageSummary = {
  scansToday: 0,
  scanLimit: 3,
  scansRemaining: 3,
  isGuest: true,
};

const ScanUsageContext = createContext<ScanUsageContextValue | null>(null);

export function ScanUsageProvider({ children }: { children: ReactNode }) {
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await scanService.getUsage();
      setUsage(data);
    } catch (error) {
      logger.warn("Failed to fetch scan usage", error);
      setUsage(DEFAULT_USAGE);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Immediately decrement in UI without waiting for network round-trip
  const decrementOptimistic = useCallback(() => {
    setUsage((prev) =>
      prev
        ? {
            ...prev,
            scansToday: prev.scansToday + 1,
            scansRemaining: Math.max(0, prev.scansRemaining - 1),
          }
        : prev,
    );
  }, []);

  return (
    <ScanUsageContext.Provider
      value={{ usage, isLoading, refresh, decrementOptimistic }}
    >
      {children}
    </ScanUsageContext.Provider>
  );
}

export function useScanUsageContext(): ScanUsageContextValue {
  const ctx = useContext(ScanUsageContext);
  if (!ctx)
    throw new Error(
      "useScanUsageContext must be used within ScanUsageProvider",
    );
  return ctx;
}
