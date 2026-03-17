import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { requireSubscription } from "../middleware/requireSubscription";
import { scanRateLimiter } from "../middleware/rateLimiter";

const router: Router = Router();

// All scan routes require auth + active subscription
router.use(requireAuth);
router.use(requireSubscription);
router.use(scanRateLimiter);

// POST /api/scans — stubbed, implemented in Phase 5
router.post("/", async (_req, res) => {
  res.json({ success: true, message: "Scan endpoint ready — Phase 5" });
});

// GET /api/scans — stubbed, implemented in Phase 10
router.get("/", async (_req, res) => {
  res.json({ success: true, message: "History endpoint ready — Phase 10" });
});

export default router;
