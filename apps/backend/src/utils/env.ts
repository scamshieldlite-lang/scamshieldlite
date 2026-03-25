import { z } from "zod";
import dotenv from "dotenv";

// Ensure .env is loaded before validation
dotenv.config();

const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3000),

  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

  // Auth (Better Auth)
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),

  // CORS
  ALLOWED_ORIGINS: z.string().default("exp://localhost:8081"),
  CORS_ORIGIN: z.string().default("*"),

  // AI Providers
  AI_PROVIDER: z
    .enum(["puter", "openai", "anthropic", "gemini"])
    .default("puter"),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  // Rate Limiting & Scan Limits
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(20),
  GUEST_DAILY_SCAN_LIMIT: z.coerce.number().default(3),
  REGISTERED_DAILY_SCAN_LIMIT: z.coerce.number().default(20),
  TRIAL_DAILY_SCAN_LIMIT: z.coerce.number().default(20),

  // Subscription / Trial
  TRIAL_DURATION_DAYS: z.coerce.number().default(3),
});

// Validate and throw early if configuration is broken
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

// Object.freeze ensures the configuration cannot be modified at runtime
export const env = Object.freeze(parsed.data);

// Helpful derived constants
export const isDev = env.NODE_ENV === "development";
export const isProd = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";

export type Env = typeof env;
