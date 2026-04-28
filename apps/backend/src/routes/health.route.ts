import { Router, type Request, type Response } from "express";
import { db } from "@/db";
import { logger } from "@/utils/logger";

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

export default router;
