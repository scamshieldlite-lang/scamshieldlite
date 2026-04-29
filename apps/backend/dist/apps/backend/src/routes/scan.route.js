import { Router } from "express";
import { optionalAuth } from "../middleware/optionalAuth.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { rateLimitMiddleware } from "../middleware/rateLimit.js";
import { scanController } from "../controllers/scan.controller.js";
const router = Router();
// Usage check — no auth required
router.get("/usage", optionalAuth, scanController.getUsage);
// Scan — rate limited, optional auth
router.post("/", optionalAuth, rateLimitMiddleware, scanController.analyze);
// History — requires authentication
router.get("/history", requireAuth, // ← confirm this is present
scanController.getHistory);
export default router;
//# sourceMappingURL=scan.route.js.map