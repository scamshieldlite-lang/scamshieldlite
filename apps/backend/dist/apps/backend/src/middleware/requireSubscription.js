import { db } from "../db/index.js";
import { subscriptions } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { logger } from "../utils/logger.js";
export async function requireSubscription(req, res, next) {
    try {
        // requireAuth must run before this middleware
        if (!req.user) {
            res.status(401).json({ success: false, error: "Unauthorized." });
            return;
        }
        const [subscription] = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.userId, req.user.id))
            .limit(1);
        if (!subscription) {
            res.status(403).json({
                success: false,
                error: "No subscription found.",
                code: "NO_SUBSCRIPTION",
            });
            return;
        }
        const now = new Date();
        // Allow access during active trial
        if (subscription.status === "trialing" && subscription.trialEnd > now) {
            next();
            return;
        }
        // Allow access with active paid subscription
        if (subscription.status === "active" &&
            subscription.currentPeriodEnd &&
            subscription.currentPeriodEnd > now) {
            next();
            return;
        }
        // Trial expired or subscription lapsed
        res.status(403).json({
            success: false,
            error: "Subscription required to continue.",
            code: "SUBSCRIPTION_REQUIRED",
            trialExpired: subscription.status === "trialing",
        });
    }
    catch (error) {
        logger.error(error instanceof Error ? error : new Error(String(error)), "Database connection failed");
        res.status(500).json({ success: false, error: "Internal server error." });
    }
}
//# sourceMappingURL=requireSubscription.js.map