import { apiClient } from "./api.service";
import type {
  SubscriptionState,
  SubscriptionStatusResponse,
  VerifyPurchaseRequest,
  VerifyPurchaseResponse,
} from "@scamshieldlite/shared/";
import { logger } from "@/utils/logger";

export const subscriptionService = {
  async getStatus(): Promise<SubscriptionState> {
    const { data } = await apiClient.get<SubscriptionStatusResponse>(
      "/subscription/status",
    );
    return data.subscription;
  },

  async verifyPurchase(
    payload: VerifyPurchaseRequest,
  ): Promise<VerifyPurchaseResponse> {
    try {
      const { data } = await apiClient.post<VerifyPurchaseResponse>(
        "/subscription/verify-purchase",
        payload,
      );
      return data;
    } catch (error: any) {
      // If 401, wait 2 seconds and retry once
      // Purchase flow timing can cause temporary auth issues
      if (error?.response?.status === 401) {
        logger.warn("verify-purchase got 401 — retrying after delay");
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const { data } = await apiClient.post<VerifyPurchaseResponse>(
          "/subscription/verify-purchase",
          payload,
        );
        return data;
      }
      throw error;
    }
  },
};
