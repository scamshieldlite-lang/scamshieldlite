import { Router } from "express";
import { optionalAuth } from "@/middleware/optionalAuth";
import { requireAuth } from "@/middleware/requireAuth";
import { rateLimitMiddleware } from "@/middleware/rateLimit";
import { scanController } from "@/controllers/scan.controller";

const router: Router = Router();

// Usage check — no auth required
router.get("/usage", optionalAuth, scanController.getUsage);

// Scan — rate limited, optional auth
router.post("/", optionalAuth, rateLimitMiddleware, scanController.analyze);

// History — requires authentication
router.get(
  "/history",
  requireAuth, // ← confirm this is present
  scanController.getHistory,
);

export default router;
