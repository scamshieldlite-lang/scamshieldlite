// src/db/index.ts

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

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

// Named export for clean imports throughout the app:
// import { db } from '@/db'
