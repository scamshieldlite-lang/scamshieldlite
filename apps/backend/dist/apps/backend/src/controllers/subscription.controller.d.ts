import type { Request, Response, NextFunction } from "express";
export declare const subscriptionController: {
    /**
     * GET /api/subscription/status
     * Returns the current subscription state for the authenticated user.
     */
    getStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    ensureTrial(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/subscription/verify-purchase
     * Validates a Google Play purchase token server-side and activates
     * the subscription. Never trust the client for purchase validation.
     */
    verifyPurchase(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/subscription/webhook
     * Handles Real-Time Developer Notifications from Google Play.
     * Google sends these when subscriptions renew, expire, or cancel.
     *
     * Security: validates the request using HMAC signature.
     */
    handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=subscription.controller.d.ts.map