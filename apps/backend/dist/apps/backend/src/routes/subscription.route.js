import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { subscriptionController } from "../controllers/subscription.controller.js";
import express from "express";
const router = Router();
router.get("/status", requireAuth, subscriptionController.getStatus);
router.post("/ensure-trial", requireAuth, subscriptionController.ensureTrial);
router.post("/verify-purchase", requireAuth, subscriptionController.verifyPurchase);
router.post("/webhook", express.raw({ type: "application/json" }), subscriptionController.handleWebhook);
export default router;
//# sourceMappingURL=subscription.route.js.map