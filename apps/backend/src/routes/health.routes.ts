// src/routes/health.routes.ts

import { Router } from "express";
import type { Request, Response } from "express";
import { testDbConnection } from "../db";

const router: Router = Router();

// GET /health — used by Railway to confirm the service is alive
router.get("/", async (_req: Request, res: Response) => {
  try {
    await testDbConnection();
    res.json({
      success: true,
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      success: false,
      status: "degraded",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
