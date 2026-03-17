// src/lib/auth.ts

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema";
import { env } from "../utils/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema, // passes your full schema so BA finds its tables
  }),

  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // flip to true before Play Store release
    minPasswordLength: 8,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh session if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 min client cache
    },
  },

  // Mobile app origins — React Native doesn't use cookies so we
  // rely on Bearer tokens in Authorization header instead
  trustedOrigins: env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()),
  logger: {
    level: "debug",
    enabled: true,
  },
});

// Infer types used elsewhere
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
