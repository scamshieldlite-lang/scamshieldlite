// apps/backend/src/index.ts

import "dotenv/config";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";

import { env, isDev } from "./utils/env";
import { logger } from "./utils/logger";
import { testDbConnection } from "./db";
import { auth } from "./lib/auth";
import { apiRateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";

import healthRoutes from "./routes/health.routes";
import scanRoutes from "./routes/scan.routes";

const app: Application = express();

// ─── Security middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" })); // reject oversized payloads
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ─── Global rate limiter ──────────────────────────────────────────────────────
app.use(apiRateLimiter);

// ─── Better Auth — must be mounted BEFORE other routes ────────────────────────
// Handles all /api/auth/* routes internally
app.use("/api/auth", toNodeHandler(auth));

// ─── App routes ───────────────────────────────────────────────────────────────
app.use("/health", healthRoutes);
app.use("/api/scans", scanRoutes);

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found." });
});

// ─── Global error handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  await testDbConnection();

  const port = parseInt(env.PORT);
  app.listen(port, () => {
    logger.info(`Server running on port ${port}`, {
      env: env.NODE_ENV,
      authUrl: env.BETTER_AUTH_URL,
    });

    if (isDev) {
      logger.info(`Health: http://localhost:${port}/health`);
      logger.info(`Auth:   http://localhost:${port}/api/auth`);
      logger.info(`Scans:  http://localhost:${port}/api/scans`);
    }
  });
}

bootstrap().catch((error) => {
  logger.error("Failed to start server", error);
  process.exit(1);
});

export default app;
