export type SubscriptionPlan = "free_trial" | "paid" | "expired" | "guest";
export type UserSubscriptionStatus = "trialing" | "active" | "expired" | "cancelled";
export interface SubscriptionState {
    plan: SubscriptionPlan;
    status: UserSubscriptionStatus | null;
    trialEndsAt: string | null;
    currentPeriodEnd: string | null;
    isTrialActive: boolean;
    isPaidActive: boolean;
    hasFullAccess: boolean;
    daysRemaining: number | null;
}
export interface VerifyPurchaseRequest {
    purchaseToken: string;
    productId: string;
    packageName: string;
    orderId?: string;
}
export interface VerifyPurchaseResponse {
    success: boolean;
    subscription: SubscriptionState;
    message: string;
}
export interface SubscriptionStatusResponse {
    subscription: SubscriptionState;
}
export declare const PRODUCT_IDS: {
    readonly MONTHLY: "scamshieldlite_monthly";
    readonly YEARLY: "scamshieldlite_yearly";
};
export type ProductId = (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS];
export declare const PRODUCT_PRICES: Record<ProductId, string>;
//# sourceMappingURL=subscription.d.ts.map