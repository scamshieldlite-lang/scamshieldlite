import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { subscriptionService } from "@/services/subscription.service";
import { useAuthContext } from "@/context/AuthContext";
import type { SubscriptionState } from "@scamshieldlite/shared/";
import { logger } from "@/utils/logger";

interface SubscriptionContextValue {
  subscription: SubscriptionState | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

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

const SubscriptionContext = createContext<SubscriptionContextValue | null>(
  null,
);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionState | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  // ← consume authState so we can react to login/logout
  const { authState } = useAuthContext();

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const state = await subscriptionService.getStatus();
      setSubscription(state);
      logger.debug("Subscription state refreshed:", JSON.stringify(state));
    } catch (error) {
      logger.error("Failed to fetch subscription state", error);
    } finally {
      setIsLoading(false);
    }
  }, []); // stable

  // ← re-fetch whenever authState changes
  useEffect(() => {
    logger.debug("SubscriptionContext: authState changed to", authState);

    if (authState === "guest" || authState === "unauthenticated") {
      setSubscription(GUEST_STATE);
      return;
    }

    // authenticated — fetch real subscription state
    refresh();
  }, [authState]); // intentionally NOT including refresh

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
