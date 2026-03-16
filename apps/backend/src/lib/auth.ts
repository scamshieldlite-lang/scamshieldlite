// src/lib/auth.ts

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema, // ← pass schema so BA finds its tables
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // set true in production
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 min client-side cache
    },
  },
  trustedOrigins: [process.env.MOBILE_APP_ORIGIN ?? "exp://localhost:8081"],
});

export type Auth = typeof auth;
