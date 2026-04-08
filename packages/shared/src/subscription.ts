// packages/shared/subscription.ts

export type SubscriptionPlan = "free_trial" | "paid" | "expired" | "guest";
export type UserSubscriptionStatus =
  | "trialing"
  | "active"
  | "expired"
  | "cancelled";

export interface SubscriptionState {
  plan: SubscriptionPlan;
  status: UserSubscriptionStatus | null;
  trialEndsAt: string | null; // ISO string
  currentPeriodEnd: string | null; // ISO string
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

// Google Play product IDs — must match Play Console exactly
export const PRODUCT_IDS = {
  MONTHLY: "scamshieldlite_monthly",
  YEARLY: "scamshieldlite_yearly",
} as const;

export type ProductId = (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS];

// Pricing display — update to match your Play Console prices
export const PRODUCT_PRICES: Record<ProductId, string> = {
  [PRODUCT_IDS.MONTHLY]: "₦1,500/month",
  [PRODUCT_IDS.YEARLY]: "₦12,000/year",
};
