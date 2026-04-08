// apps/backend/src/services/googlePlay.service.ts

import { google } from "googleapis";
import { env } from "@/utils/env";
import { logger } from "@/utils/logger";

interface PurchaseInfo {
  orderId: string;
  startTimeMillis: string;
  expiryTimeMillis: string;
  autoRenewing: boolean;
  paymentState: number; // 0=pending, 1=received, 2=free trial
  cancelReason?: number;
}

/**
 * Google Play verifier.
 *
 * Uses a service account JWT to authenticate with the
 * Google Play Developer API and verify subscription tokens.
 *
 * Setup:
 * 1. Create a service account in Google Cloud Console
 * 2. Grant it "Financial data viewer" in Play Console → Users & permissions
 * 3. Download the JSON key and extract email + private_key into env
 */
class GooglePlayService {
  private getAuthClient() {
    if (
      !env.GOOGLE_PLAY_SERVICE_ACCOUNT_EMAIL ||
      !env.GOOGLE_PLAY_PRIVATE_KEY
    ) {
      throw new Error(
        "Google Play service account credentials are not configured",
      );
    }

    return new google.auth.JWT({
      email: env.GOOGLE_PLAY_SERVICE_ACCOUNT_EMAIL,
      key: env.GOOGLE_PLAY_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/androidpublisher"],
    });
  }

  /**
   * Verify a subscription purchase token.
   * Returns null if the token is invalid or the purchase is not active.
   */
  async verifySubscription(
    purchaseToken: string,
    productId: string,
  ): Promise<PurchaseInfo | null> {
    try {
      const auth = this.getAuthClient();
      const androidPublisher = google.androidpublisher({
        version: "v3",
        auth,
      });

      const response = await androidPublisher.purchases.subscriptions.get({
        packageName: env.GOOGLE_PLAY_PACKAGE_NAME,
        subscriptionId: productId,
        token: purchaseToken,
      });

      const purchase = response.data;

      // Payment state 1 = received, 2 = free trial via Play
      const isPaymentReceived =
        purchase.paymentState === 1 || purchase.paymentState === 2;

      if (!isPaymentReceived) {
        logger.warn(
          { productId, paymentState: purchase.paymentState },
          "Play purchase token has unpaid state",
        );
        return null;
      }

      return {
        orderId: purchase.orderId ?? "",
        startTimeMillis: purchase.startTimeMillis ?? "0",
        expiryTimeMillis: purchase.expiryTimeMillis ?? "0",
        autoRenewing: purchase.autoRenewing ?? false,
        paymentState: purchase.paymentState ?? 0,
        cancelReason: purchase.cancelReason ?? undefined,
      };
    } catch (error) {
      logger.error(
        { error, productId },
        "Google Play purchase verification failed",
      );
      return null;
    }
  }

  /**
   * Acknowledge a subscription purchase.
   * Google Play requires acknowledgment within 3 days
   * or the purchase is automatically refunded.
   */
  async acknowledgePurchase(
    purchaseToken: string,
    productId: string,
  ): Promise<void> {
    try {
      const auth = this.getAuthClient();
      const androidPublisher = google.androidpublisher({
        version: "v3",
        auth,
      });

      await androidPublisher.purchases.subscriptions.acknowledge({
        packageName: env.GOOGLE_PLAY_PACKAGE_NAME,
        subscriptionId: productId,
        token: purchaseToken,
      });

      logger.info({ productId }, "Play purchase acknowledged");
    } catch (error) {
      // Non-fatal — log and continue. Acknowledgment can be retried.
      logger.error({ error, productId }, "Failed to acknowledge Play purchase");
    }
  }
}

export const googlePlayService = new GooglePlayService();
