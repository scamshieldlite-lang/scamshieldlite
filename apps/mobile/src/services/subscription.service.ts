import { apiClient } from "./api.service";
import type {
  SubscriptionState,
  SubscriptionStatusResponse,
  VerifyPurchaseRequest,
  VerifyPurchaseResponse,
} from "@scamshieldlite/shared/";

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
    const { data } = await apiClient.post<VerifyPurchaseResponse>(
      "/subscription/verify-purchase",
      payload,
    );
    return data;
  },
};
