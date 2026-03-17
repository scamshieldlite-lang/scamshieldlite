import { z } from "zod";

const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("3000"),

  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

  // Better Auth
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),

  // CORS — comma-separated list of allowed origins
  ALLOWED_ORIGINS: z.string().default("exp://localhost:8081"),

  // AI Provider
  AI_PROVIDER: z.enum(["puter", "openai", "anthropic"]).default("puter"),
  // Optional — only required when AI_PROVIDER is not puter
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string().default("60000"), // 1 minute
  RATE_LIMIT_MAX_REQUESTS: z.string().default("20"),
});

// Parse and validate — throws at startup if invalid
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌  Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

// Derived helpers
export const isDev = env.NODE_ENV === "development";
export const isProd = env.NODE_ENV === "production";
