// apps/backend/src/app.ts

import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import { env } from "@/utils/env";
import { logger } from "@/utils/logger";
import { requestId } from "@/middleware/requestId";
import { errorHandler } from "@/middleware/errorHandler";
import apiRouter from "@/routes/index";

export function createApp(): Application {
  const app = express();

  // ── Security headers ───────────────────────────────────────────
  app.use(helmet());

  // ── CORS ───────────────────────────────────────────────────────
  app.use(
    cors({
      origin: env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN.split(","),
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Request-ID",
        "X-Device-Fingerprint",
      ],
    }),
  );

  // ── Compression ────────────────────────────────────────────────
  app.use(compression());

  // ── Request ID (before logging so every log line has an ID) ───
  app.use(requestId);

  // ── HTTP request logging ───────────────────────────────────────
  app.use(
    morgan("combined", {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
      skip: (_req, res) =>
        // Skip health checks from logs to reduce noise
        res.statusCode === 200 && _req.path === "/api/health",
    }),
  );

  // ── Body parsing ───────────────────────────────────────────────
  app.use(express.json({ limit: "50kb" })); // Intentionally small — no file uploads yet
  app.use(express.urlencoded({ extended: true, limit: "50kb" }));

  // ── Trust proxy (required on Render, Railway, Fly.io) ─────────
  if (env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  // ── API routes ─────────────────────────────────────────────────
  app.use("/api", apiRouter);

  // ── 404 handler ────────────────────────────────────────────────
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: "Route not found",
      code: "NOT_FOUND",
    });
  });

  // ── Centralized error handler (must be last) ───────────────────
  app.use(errorHandler);

  return app;
}
