import { useState, useCallback, useEffect } from "react";
import {
  useIAP,
  ErrorCode,
  type Purchase,
  type ProductSubscription,
  finishTransaction,
} from "react-native-iap";
import { subscriptionService } from "@/services/subscription.service";
import { useSubscriptionContext } from "@/context/SubscriptionContext";
import { useScanUsageContext } from "@/context/ScanUsageContext"; // 1. Added import
import { PRODUCT_IDS, type ProductId } from "@shared/subscription";
import { logger } from "@/utils/logger";
import { extractErrorMessage } from "@/utils/errorMessage";
import Constants from "expo-constants";
import { useAuth } from "./useAuth";

type PurchaseState =
  | "idle"
  | "initializing"
  | "ready"
  | "purchasing"
  | "verifying"
  | "success"
  | "error";

interface UseSubscriptionReturn {
  state: PurchaseState;
  products: ProductSubscription[];
  error: string | null;
  purchase: (productId: ProductId) => Promise<void>;
  reset: () => void;
}

const PACKAGE_NAME =
  Constants.expoConfig?.android?.package ?? "com.scamshieldlite.app";

export function useSubscription(): UseSubscriptionReturn {
  const { setPurchasing } = useAuth();
  const [state, setState] = useState<PurchaseState>("initializing");
  const [error, setError] = useState<string | null>(null);

  // 2. Consume both contexts and rename `refresh` to avoid collisions
  const { refresh: refreshSubscription } = useSubscriptionContext();
  const { refresh: refreshUsage } = useScanUsageContext();

  // ── useIAP v14 — callbacks handle purchase lifecycle ────────────
  const {
    connected,
    subscriptions, // populated after fetchProducts({ type: "subs" })
    fetchProducts,
    requestPurchase,
  } = useIAP({
    /**
     * Called when Google Play confirms a purchase.
     * Do NOT call finishTransaction before backend verification —
     * if your server rejects the token, you need to be able to refund.
     */
    onPurchaseSuccess: async (purchase: Purchase) => {
      setState("verifying");

      const verifyWithTimeout = async () => {
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  "Server verification timed out. Don't worry, your payment is safe.",
                ),
              ),
            15000, // 15s timeout
          ),
        );
        return Promise.race([
          subscriptionService.verifyPurchase({
            purchaseToken: purchase.purchaseToken!,
            productId: purchase.productId,
            packageName: PACKAGE_NAME,
          }),
          timeout,
        ]);
      };

      try {
        // 1. Verify with backend
        await verifyWithTimeout();

        // 2. ONLY acknowledge after backend confirms
        await finishTransaction({
          purchase,
          isConsumable: false,
        });

        Promise.all([refreshSubscription(), refreshUsage()]).catch((err) =>
          logger.error("Non-fatal context refresh error:", err),
        );

        logger.info(
          `Purchase verified and refreshing UI: ${purchase.productId}`,
        );

        setState("success");
      } catch (err) {
        const message = extractErrorMessage(err);
        logger.error("Purchase verification failed or timed out:", message);
        // Friendly error explaining their money is safe
        setError(
          "Verification took too long. If you were charged, tap 'Restore Purchases' or restart the app to activate.",
        );
        setState("error");
      } finally {
        setPurchasing(false);
      }
    },

    onPurchaseError: (err) => {
      setPurchasing(false);
      // User cancelled — treat as soft exit, not an error
      if (err.code === ErrorCode.UserCancelled) {
        setState("ready");
        return;
      }
      logger.error("IAP purchase error", err);
      setError(err.message ?? "Purchase failed. Please try again.");
      setState("error");
    },
  });

  // ── Fetch products once connection is ready ───────────────────
  useEffect(() => {
    if (!connected) return;

    async function loadProducts() {
      try {
        await fetchProducts({
          skus: Object.values(PRODUCT_IDS),
          type: "subs", // "subs" for subscriptions, "iap" for one-time
        });
        setState("ready");
        logger.info("IAP subscription products loaded");
      } catch (err) {
        logger.error("Failed to load IAP products", err);
        setError(
          "Could not load subscription products. Check your connection.",
        );
        setState("error");
      }
    }

    loadProducts();
  }, [connected, fetchProducts]);

  // ── Initiate purchase ─────────────────────────────────────────
  const purchase = useCallback(
    async (productId: ProductId) => {
      if (state !== "ready") return;

      setState("purchasing");
      setError(null);
      // Tell AuthContext not to clear session during purchase
      // Google Play takes user out of app during payment flow
      setPurchasing(true);

      try {
        await requestPurchase({
          request: {
            google: {
              skus: [productId],
            },
          },
          type: "subs",
        });
      } catch (err) {
        const msg = extractErrorMessage(err);
        if (!msg.toLowerCase().includes("cancel")) {
          setError(msg);
          setState("error");
        } else {
          setState("ready");
        }
        // Clear purchasing flag on error or cancel
        setPurchasing(false);
      }
    },
    [state, requestPurchase, setPurchasing],
  );

  const reset = useCallback(() => {
    setState("ready");
    setError(null);
  }, []);

  return {
    state,
    products: subscriptions,
    error,
    purchase,
    reset,
  };
}
