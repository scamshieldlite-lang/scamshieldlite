import { Router } from "express";
import { requireAuth } from "@/middleware/requireAuth";
import { subscriptionController } from "@/controllers/subscription.controller";
import express from "express";

const router: Router = Router();

// Authenticated routes
router.get("/status", requireAuth, subscriptionController.getStatus);
router.post(
  "/verify-purchase",
  requireAuth,
  subscriptionController.verifyPurchase,
);

// Webhook — no auth, signature-verified instead
// Must use raw body for HMAC validation
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  subscriptionController.handleWebhook,
);

export default router;
