import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { privacyController } from "../controllers/privacy.controller.js";
const router = Router();
// All privacy routes require authentication
router.use(requireAuth);
router.get("/settings", privacyController.getSettings);
router.patch("/settings", privacyController.updateSettings);
router.post("/consent", privacyController.recordConsent);
router.get("/export", privacyController.exportData);
router.delete("/scan-history", privacyController.deleteScanHistory);
router.delete("/account", privacyController.deleteAccount);
export default router;
//# sourceMappingURL=privacy.route.js.map