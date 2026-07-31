import { Router, type Request, type Response } from "express";
import { db } from "@/db/index.js";
import { logger } from "@/utils/logger.js";

const router: Router = Router();

// router.get("/", async (_req: Request, res: Response) => {
//   try {
//     // Verify DB is reachable
//     await db.execute("SELECT 1" as any);

//     res.json({
//       status: "ok",
//       timestamp: new Date().toISOString(),
//       uptime: process.uptime(),
//       environment: process.env.NODE_ENV,
//     });
//   } catch (error) {
//     logger.error({ error }, "Health check failed");
//     res.status(503).json({
//       status: "error",
//       message: "Database unreachable",
//       timestamp: new Date().toISOString(),
//     });
//   }
// });

router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.get("/db", async (_req: Request, res: Response) => {
  try {
    await db.execute("SELECT 1" as any);
    res.json({ status: "db-ok" });
  } catch {
    res.status(503).json({ status: "db-error" });
  }
});

// ── Version endpoint ──────────────────────────────────────────────
// Returns which deployment handled the request and what version is running.
// Useful for confirming Railway vs Render and that deployments are in sync.
router.get("/version", (_req: Request, res: Response) => {
  res.json({
    version: process.env.npm_package_version ?? "1.0.0",
    environment: process.env.NODE_ENV ?? "unknown",
    // DEPLOYMENT_ENV is set differently on Railway vs Render
    // so you can immediately see which backend responded
    deployment: process.env.DEPLOYMENT_ENV ?? "unknown",
    // Shows when this instance started — useful for detecting restarts
    startedAt: new Date(Date.now() - process.uptime() * 1000).toISOString(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
