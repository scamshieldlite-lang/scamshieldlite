import { Router } from "express";
import healthRouter from "./health.route.js";
import scanRouter from "./scan.route.js";
import reportRouter from "./report.route.js";
import subscriptionRouter from "./subscription.route.js";
import privacyRouter from "./privacy.route.js";
import { auth } from "../lib/auth.js";
import { toNodeHandler } from "better-auth/node";
const router = Router();
// Better Auth handles all /api/auth/* routes natively
router.use("/auth/", toNodeHandler(auth));
// Application routes
router.use("/health", healthRouter);
router.use("/scan", scanRouter);
router.use("/report", reportRouter);
router.use("/subscription", subscriptionRouter);
router.use("/privacy", privacyRouter);
export default router;
//# sourceMappingURL=index.js.map