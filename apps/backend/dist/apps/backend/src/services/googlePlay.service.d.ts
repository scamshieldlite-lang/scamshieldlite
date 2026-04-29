interface PurchaseInfo {
    orderId: string;
    startTimeMillis: string;
    expiryTimeMillis: string;
    autoRenewing: boolean;
    paymentState: number;
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
declare class GooglePlayService {
    private getAuthClient;
    /**
     * Verify a subscription purchase token.
     * Returns null if the token is invalid or the purchase is not active.
     */
    verifySubscription(purchaseToken: string, productId: string): Promise<PurchaseInfo | null>;
    /**
     * Acknowledge a subscription purchase.
     * Google Play requires acknowledgment within 3 days
     * or the purchase is automatically refunded.
     */
    acknowledgePurchase(purchaseToken: string, productId: string): Promise<void>;
}
export declare const googlePlayService: GooglePlayService;
export {};
//# sourceMappingURL=googlePlay.service.d.ts.map