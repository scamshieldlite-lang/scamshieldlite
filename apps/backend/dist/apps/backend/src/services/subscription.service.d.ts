import { subscriptions } from "../db/schema.js";
import type { SubscriptionState } from "../../../../packages/shared/scan";
export declare const subscriptionService: {
    createTrialSubscription(userId: string, trialDays: number): Promise<void>;
    getSubscription(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: "trialing" | "active" | "expired" | "cancelled";
        planId: string | null;
        trialStart: Date;
        trialEnd: Date;
        currentPeriodEnd: Date | null;
        playPurchaseToken: string | null;
    } | undefined>;
    getSubscriptionState(userId: string): Promise<SubscriptionState>;
    isTrialActive(userId: string): Promise<boolean>;
    isPaidActive(userId: string): Promise<boolean>;
    hasFullAccess(userId: string): Promise<boolean>;
    verifyAndActivate(userId: string, purchaseToken: string, productId: string): Promise<SubscriptionState>;
    handleRenewal(userId: string, purchaseToken: string, productId: string, expiryTimeMillis: string): Promise<void>;
    handleCancellation(userId: string): Promise<void>;
    buildState(sub: typeof subscriptions.$inferSelect | null): SubscriptionState;
};
//# sourceMappingURL=subscription.service.d.ts.map