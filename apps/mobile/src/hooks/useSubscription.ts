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
import { PRODUCT_IDS, type ProductId } from "@shared/subscription";
import { logger } from "@/utils/logger";
import { extractErrorMessage } from "@/utils/errorMessage";
import Constants from "expo-constants";

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
  const [state, setState] = useState<PurchaseState>("initializing");
  const [error, setError] = useState<string | null>(null);
  const { refresh } = useSubscriptionContext();

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

      try {
        if (!purchase.purchaseToken) {
          throw new Error("No purchase token in response");
        }

        // 1. Verify server-side
        await subscriptionService.verifyPurchase({
          purchaseToken: purchase.purchaseToken,
          productId: purchase.productId,
          packageName: PACKAGE_NAME,
        });

        // 2. Acknowledge — only after successful backend verification
        await finishTransaction({
          purchase,
          isConsumable: false,
        });

        // 3. Refresh app-wide subscription state
        await refresh();

        setState("success");
        logger.info("Purchase verified and acknowledged", {
          productId: purchase.productId,
        });
      } catch (err) {
        logger.error("Purchase verification failed", err);
        setError(extractErrorMessage(err));
        setState("error");
      }
    },

    onPurchaseError: (err) => {
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

      try {
        await requestPurchase({
          request: {
            // v14 uses platform-specific request objects
            google: {
              skus: [productId],
            },
          },
          type: "subs",
        });
        // onPurchaseSuccess / onPurchaseError handles the rest
      } catch (err) {
        const msg = extractErrorMessage(err);
        // Cancelled is handled by onPurchaseError — only catch real errors
        if (!msg.toLowerCase().includes("cancel")) {
          setError(msg);
          setState("error");
        } else {
          setState("ready");
        }
      }
    },
    [state, requestPurchase],
  );

  const reset = useCallback(() => {
    setState("ready");
    setError(null);
  }, []);

  return {
    state,
    products: subscriptions, // useIAP stores fetched subs in `subscriptions`
    error,
    purchase,
    reset,
  };
}
