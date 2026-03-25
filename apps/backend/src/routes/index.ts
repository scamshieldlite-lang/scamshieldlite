import { Router } from "express";
import healthRouter from "./health.route";
import scanRouter from "./scan.route";
import reportRouter from "./report.route";
import subscriptionRouter from "./subscription.route";
import { auth } from "@/lib/auth";
import { toNodeHandler } from "better-auth/node";

const router: Router = Router();

// Better Auth handles all /api/auth/* routes natively
router.all("/auth/*", toNodeHandler(auth));

// Application routes
router.use("/health", healthRouter);
router.use("/scan", scanRouter);
router.use("/report", reportRouter);
router.use("/subscription", subscriptionRouter);

export default router;
