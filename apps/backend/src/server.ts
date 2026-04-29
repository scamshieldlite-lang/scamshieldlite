import { createApp } from "./app.js";
import { env } from "@/utils/env.js";
import { logger } from "@/utils/logger.js";
import { testDbConnection } from "@/db/index.js";
import {
  startRetentionScheduler,
  stopRetentionScheduler,
} from "./jobs/retention.job.js";

async function bootstrap(): Promise<void> {
  // 1. Verify DB before accepting traffic
  const app = createApp();

  const host = env.NODE_ENV === "production" ? "0.0.0.0" : env.SERVER_HOST;

  const server = app.listen(env.PORT, host, () => {
    logger.info(
      {
        port: env.PORT,
        env: env.NODE_ENV,
      },
      "🛡️ Server running",
    );
  });

  console.log("Server running on port", process.env.PORT);

  // Run async stuff AFTER server starts
  testDbConnection()
    .then(() => {
      logger.info("✅ DB connected");
      startRetentionScheduler();
    })
    .catch((err) => {
      logger.error({ err }, "❌ DB connection failed");
    });

  // 4. Graceful shutdown — finish in-flight requests before exiting
  const shutdown = (signal: string) => {
    logger.info({ signal }, "Shutdown signal received");
    stopRetentionScheduler();

    server.close(() => {
      logger.info("HTTP server closed");
      process.exit(0);
    });

    // Force exit after 10s if requests hang
    setTimeout(() => {
      logger.error("Forcing exit after timeout");
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // 5. Catch unhandled promise rejections — log and exit cleanly
  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandled promise rejection");
    process.exit(1);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
