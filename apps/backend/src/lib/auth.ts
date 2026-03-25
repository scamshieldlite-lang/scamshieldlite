import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { env } from "@/utils/env";
import { logger } from "@/utils/logger";
import { subscriptionService } from "@/services/subscription.service";
import { createAuthMiddleware } from "better-auth/api";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema, // Pass the whole schema so Better Auth can find user/session tables
  }),

  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  // 1. Important: Keep your trusted origins for the Mobile/Web app
  trustedOrigins: env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()),

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false,
    autoSignIn: true,
  },

  hooks: {
    // Change this from an array to a single middleware call
    after: createAuthMiddleware(async (ctx) => {
      // Manually match the path inside the middleware
      if (ctx.path === "/sign-up/email") {
        try {
          // In Better Auth v1.5+, check both locations for the ID
          const userId =
            ctx.context.newSession?.user?.id || ctx.context.newSession?.user.id;

          if (!userId) {
            logger.warn(
              "Signup successful but no user ID found for subscription",
            );
            return;
          }

          await subscriptionService.createTrialSubscription(
            userId,
            env.TRIAL_DURATION_DAYS,
          );

          logger.info({ userId }, "Trial subscription created for new user");
        } catch (error) {
          logger.error({ error }, "Failed to create trial subscription");
        }
      }
    }),
  },

  advanced: {
    // 4. Ensures cookies work on Render/Railway/Vercel (Production only)
    useSecureCookies: env.NODE_ENV === "production",
  },
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
