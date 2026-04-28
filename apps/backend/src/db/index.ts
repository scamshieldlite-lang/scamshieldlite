// src/db/index.ts

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { logger } from "@/utils/logger";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// postgres-js connection — used by Drizzle
const queryClient = postgres(process.env.DATABASE_URL, {
  max: 10, // connection pool size
  idle_timeout: 20, // close idle connections after 20s
  connect_timeout: 10, // fail fast if DB is unreachable
});

export const db = drizzle(queryClient, { schema });

// Test connection on startup
export async function testDbConnection(): Promise<void> {
  try {
    await queryClient`SELECT 1`;
    logger.info("Database connection established");
  } catch (error) {
    logger.error(
      error instanceof Error ? error : new Error(String(error)),
      "Database connection failed",
    );
    process.exit(1);
  }
}
