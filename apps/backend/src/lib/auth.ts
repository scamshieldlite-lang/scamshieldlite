import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema";
import { subscriptions } from "../db/schema";
import { env } from "../utils/env";
import { logger } from "../utils/logger";
import { createAuthMiddleware } from "better-auth/api";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },

  trustedOrigins: env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()),

  // ── Lifecycle hooks ─────────────────────────────────────────────
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // 2. Wrap the whole function
      // matcher logic moves inside the handler for global hooks
      if (ctx.path === "/sign-up/email") {
        try {
          // In v1.5+, the session is inside ctx.context.newSession
          const userId = ctx.context.newSession?.user?.id;

          if (!userId) {
            logger.warn("Signup successful but no user ID found in session");
            return;
          }

          const trialStart = new Date();
          const trialEnd = new Date();
          trialEnd.setDate(trialEnd.getDate() + 3);

          await db.insert(subscriptions).values({
            userId,
            status: "trialing",
            trialStart,
            trialEnd,
          });

          logger.info("Trial subscription created", { userId, trialEnd });
        } catch (error) {
          logger.error("Failed to create trial subscription", error);
        }
      }
    }),
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
