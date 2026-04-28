import { createApp } from "./app";
import { env } from "@/utils/env";
import { logger } from "@/utils/logger";
import { testDbConnection } from "@/db/index";
import {
  startRetentionScheduler,
  stopRetentionScheduler,
} from "./jobs/retention.job";

async function bootstrap(): Promise<void> {
  // 1. Verify DB before accepting traffic
  await testDbConnection();
  startRetentionScheduler();

  // 2. Create Express app
  const app = createApp();

  // 3. Start listening
  const host = env.NODE_ENV === "production" ? "0.0.0.0" : env.SERVER_HOST;
  const server = app.listen(env.PORT, host, () => {
    const displayUrl =
      env.NODE_ENV === "production"
        ? env.BETTER_AUTH_URL
        : `http://${host}:${env.PORT}`;
    logger.info(
      {
        port: env.PORT,
        env: env.NODE_ENV,
        url: displayUrl,
      },
      "🛡️  ScamShieldLite backend running",
    );
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
