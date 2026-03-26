import { Router } from "express";
import { optionalAuth } from "@/middleware/optionalAuth";
import { rateLimitMiddleware } from "@/middleware/rateLimit";
import { scanController } from "@/controllers/scan.controller";

const router: Router = Router();

// Usage check — no rate limit consumed, just reads current state
router.get("/usage", optionalAuth, scanController.getUsage);

// Scan — rate limit applied here, after optionalAuth resolves identity
router.post("/", optionalAuth, rateLimitMiddleware, scanController.analyze);

// History — registered users only
router.get("/history", scanController.getHistory);

export default router;
