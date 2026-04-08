import { Router } from "express";
import { requireAuth } from "@/middleware/requireAuth";
import { subscriptionController } from "@/controllers/subscription.controller";
import express from "express";

const router: Router = Router();

router.get("/status", requireAuth, subscriptionController.getStatus);
router.post(
  "/ensure-trial",
  requireAuth,
  subscriptionController.ensureTrial, // ← add this
);
router.post(
  "/verify-purchase",
  requireAuth,
  subscriptionController.verifyPurchase,
);
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  subscriptionController.handleWebhook,
);

export default router;
