import { Router } from "express";
import { requireAuth } from "@/middleware/requireAuth";
import { subscriptionController } from "@/controllers/subscription.controller";

const router: Router = Router();

// All subscription routes require authentication
router.get("/status", requireAuth, subscriptionController.getStatus);
router.post(
  "/verify-purchase",
  requireAuth,
  subscriptionController.verifyPurchase,
);

export default router;
