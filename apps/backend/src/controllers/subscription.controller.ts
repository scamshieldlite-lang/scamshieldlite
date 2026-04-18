import type { Request, Response, NextFunction } from "express";
import { subscriptionService } from "@/services/subscription.service";
import { z } from "zod";
import { InvalidInputError, UnauthorizedError } from "@/utils/errors";
import { logger } from "@/utils/logger";
import { createHmac } from "crypto";
import { env } from "@/utils/env";
import { db } from "../db/index.js";
import { subscriptions } from "../db/schema.js";
import { eq } from "drizzle-orm";
import type {
  VerifyPurchaseResponse,
  SubscriptionStatusResponse,
} from "@scamshieldlite/shared/";
import { consentService } from "@/services/consent.service.js";

const verifyPurchaseSchema = z.object({
  purchaseToken: z.string().min(1, "purchaseToken is required"),
  productId: z.string().min(1, "productId is required"),
  packageName: z.string().min(1, "packageName is required"),
});

export const subscriptionController = {
  /**
   * GET /api/subscription/status
   * Returns the current subscription state for the authenticated user.
   */
  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();

      const subscription = await subscriptionService.getSubscriptionState(
        req.user.id,
      );

      const response: SubscriptionStatusResponse = { subscription };
      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  async ensureTrial(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();

      const existing = await subscriptionService.getSubscription(req.user.id);

      if (!existing) {
        await subscriptionService.createTrialSubscription(
          req.user.id,
          env.TRIAL_DURATION_DAYS,
        );
        logger.info(
          { userId: req.user.id },
          "Trial subscription created via ensure-trial",
        );
      }

      const existingConsent = await consentService.getLatestConsent(
        req.user.id,
      );
      if (!existingConsent) {
        const ip = (
          (req.headers["x-forwarded-for"] as string) ??
          req.socket.remoteAddress ??
          "127.0.0.1"
        )
          ?.split(",")[0]
          ?.trim();
        const ua = (req.headers["user-agent"] as string) ?? "unknown";

        await consentService.recordConsent(req.user.id, ip, ua);

        logger.info(
          { userId: req.user.id },
          "Consent recorded via ensure-trial fallback",
        );
      }

      const subscription = await subscriptionService.getSubscriptionState(
        req.user.id,
      );

      res.json({ subscription });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/subscription/verify-purchase
   * Validates a Google Play purchase token server-side and activates
   * the subscription. Never trust the client for purchase validation.
   */
  async verifyPurchase(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();

      const parsed = verifyPurchaseSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new InvalidInputError(
          parsed.error.issues[0]?.message ?? "Invalid request",
        );
      }

      const { purchaseToken, productId, packageName } = parsed.data;

      // Verify package name matches our app
      if (packageName !== env.GOOGLE_PLAY_PACKAGE_NAME) {
        throw new InvalidInputError("Invalid package name");
      }

      const subscription = await subscriptionService.verifyAndActivate(
        req.user.id,
        purchaseToken,
        productId,
      );

      const response: VerifyPurchaseResponse = {
        success: true,
        subscription,
        message: "Subscription activated successfully",
      };

      logger.info(
        { userId: req.user.id, productId },
        "Purchase verified and subscription activated",
      );

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/subscription/webhook
   * Handles Real-Time Developer Notifications from Google Play.
   * Google sends these when subscriptions renew, expire, or cancel.
   *
   * Security: validates the request using HMAC signature.
   */
  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate webhook signature
      const signature = req.headers["x-goog-signature"] as string;
      if (!signature || !env.GOOGLE_PLAY_WEBHOOK_SECRET) {
        logger.warn("Webhook received without valid signature");
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const expectedSig = createHmac("sha256", env.GOOGLE_PLAY_WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest("base64");

      if (signature !== expectedSig) {
        logger.warn("Webhook signature mismatch");
        res.status(401).json({ error: "Invalid signature" });
        return;
      }

      // Parse the Pub/Sub message
      const message = req.body?.message;
      if (!message?.data) {
        res.status(200).json({ received: true });
        return;
      }

      const decoded = Buffer.from(message.data, "base64").toString();
      const notification = JSON.parse(decoded);

      const { subscriptionNotification, packageName } = notification;
      if (!subscriptionNotification) {
        // Not a subscription notification — acknowledge and ignore
        res.status(200).json({ received: true });
        return;
      }

      const { notificationType, purchaseToken, subscriptionId } =
        subscriptionNotification;

      logger.info(
        { notificationType, subscriptionId },
        "RTDN webhook received",
      );

      // Find the user by purchase token
      const sub = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.playPurchaseToken, purchaseToken),
      });

      if (!sub) {
        logger.warn(
          { purchaseToken: purchaseToken.substring(0, 20) },
          "RTDN webhook: no subscription found for token",
        );
        res.status(200).json({ received: true });
        return;
      }

      // Notification types:
      // 1=RECOVERED 2=RENEWED 3=CANCELED 4=PURCHASED 5=ON_HOLD
      // 6=IN_GRACE_PERIOD 7=RESTARTED 12=EXPIRED
      switch (notificationType) {
        case 2: // RENEWED
        case 1: // RECOVERED
          // Re-verify from Play API to get new expiry
          const purchaseInfo =
            await import("../services/googlePlay.service.js").then((m) =>
              m.googlePlayService.verifySubscription(
                purchaseToken,
                subscriptionId,
              ),
            );

          if (purchaseInfo) {
            await subscriptionService.handleRenewal(
              sub.userId,
              purchaseToken,
              subscriptionId,
              purchaseInfo.expiryTimeMillis,
            );
          }
          break;

        case 3: // CANCELED
        case 12: // EXPIRED
          await subscriptionService.handleCancellation(sub.userId);
          break;

        default:
          logger.info({ notificationType }, "Unhandled RTDN notification type");
      }

      // Always respond 200 to Pub/Sub — otherwise it retries
      res.status(200).json({ received: true });
    } catch (error) {
      logger.error({ error }, "Webhook processing error");
      // Still respond 200 to prevent Pub/Sub retry storm
      res.status(200).json({ received: true });
    }
  },
};
