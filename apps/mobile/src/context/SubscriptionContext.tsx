import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { subscriptionService } from "@/services/subscription.service";
import { useAuth } from "@/hooks/useAuth";
import type { SubscriptionState } from "@scamshieldlite/shared/";
import { logger } from "@/utils/logger";

interface SubscriptionContextValue {
  subscription: SubscriptionState | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(
  null,
);

const GUEST_STATE: SubscriptionState = {
  plan: "guest",
  status: null,
  trialEndsAt: null,
  currentPeriodEnd: null,
  isTrialActive: false,
  isPaidActive: false,
  hasFullAccess: false,
  daysRemaining: null,
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { authState, user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionState | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (authState !== "authenticated" || !user) {
      setSubscription(GUEST_STATE);
      return;
    }

    setIsLoading(true);
    try {
      const state = await subscriptionService.getStatus();
      setSubscription(state);
    } catch (error) {
      logger.error("Failed to fetch subscription state", error);
    } finally {
      setIsLoading(false);
    }
  }, [authState, user]);

  // Fetch on auth state change
  useEffect(() => {
    if (authState === "guest") {
      setSubscription(GUEST_STATE);
      return;
    }
    refresh();
  }, [authState, refresh]);

  return (
    <SubscriptionContext.Provider value={{ subscription, isLoading, refresh }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx)
    throw new Error(
      "useSubscriptionContext must be used within SubscriptionProvider",
    );
  return ctx;
}
