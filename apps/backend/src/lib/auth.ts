// import { betterAuth } from "better-auth";
// import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import { db } from "@/db";
// import * as schema from "@/db/schema";
// import { env } from "@/utils/env";
// import { logger } from "@/utils/logger";
// import { subscriptionService } from "@/services/subscription.service";
// import { createAuthMiddleware } from "better-auth/api";
// import { consentService } from "@/services/consent.service";

// export const auth = betterAuth({
//   database: drizzleAdapter(db, {
//     provider: "pg",
//     schema, // Pass the whole schema so Better Auth can find user/session tables
//   }),

//   secret: env.BETTER_AUTH_SECRET,
//   // baseURL: env.BETTER_AUTH_URL,
//   baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

//   // 1. Important: Keep your trusted origins for the Mobile/Web app
//   trustedOrigins: env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()),

//   session: {
//     expiresIn: 60 * 60 * 24 * 30, // 30 days
//     updateAge: 60 * 60 * 24, // 1 day
//     cookieCache: { enabled: true, maxAge: 60 * 5 },
//   },

//   emailAndPassword: {
//     enabled: true,
//     minPasswordLength: 8,
//     requireEmailVerification: false,
//     autoSignIn: true,
//   },

//   emailVerification: {
//     sendOnSignUp: false, // Enable in production with an email provider
//     autoSignInAfterVerification: true,
//   },

//   onAPIError: {
//     onError: (error, ctx) => {
//       logger.error({ error, ctx }, "Better Auth API error");
//     },
//   },

//   hooks: {
//     // Change this from an array to a single middleware call
//     after: createAuthMiddleware(async (ctx) => {
//       // Manually match the path inside the middleware
//       if (ctx.path === "/sign-up/email") {
//         try {
//           // In Better Auth v1.5+, check both locations for the ID
//           const userId =
//             ctx.context.newSession?.user?.id || ctx.context.newSession?.user.id;

//           if (!userId) {
//             logger.warn(
//               "Signup successful but no user ID found for subscription",
//             );
//             return;
//           }

//           await subscriptionService.createTrialSubscription(
//             userId,
//             env.TRIAL_DURATION_DAYS,
//           );

//           logger.info({ userId }, "Trial subscription created for new user");
//         } catch (error) {
//           logger.error({ error }, "Failed to create trial subscription");
//         }
//       }
//     }),
//   },

//   // Update the existing signup hook handler:
//   handler: async (context: any) => {
//     try {
//       const userId = context.context.newSession?.userId;
//       if (!userId) return;

//       // Create trial subscription
//       await subscriptionService.createTrialSubscription(
//         userId,
//         env.TRIAL_DURATION_DAYS,
//       );

//       // Record initial consent — user agreed to terms on signup screen
//       const ip = (
//         context.context.request?.headers?.get("x-forwarded-for") ?? ""
//       )
//         .split(",")[0]
//         ?.trim();
//       const ua = context.context.request?.headers?.get("user-agent") ?? "";

//       await consentService.recordConsent(userId, ip, ua);

//       logger.info({ userId }, "Trial + consent recorded for new user");
//     } catch (error) {
//       logger.error({ error }, "Post-signup hooks failed");
//     }
//   },

//   advanced: {
//     // 4. Ensures cookies work on Render/Railway/Vercel (Production only)
//     useSecureCookies: env.NODE_ENV === "production",
//   },
// });

// export type Auth = typeof auth;
// export type Session = typeof auth.$Infer.Session;
// export type User = typeof auth.$Infer.Session.user;

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { env } from "@/utils/env";
import { logger } from "@/utils/logger";
import { subscriptionService } from "@/services/subscription.service";
import { createAuthMiddleware } from "better-auth/api";
import { consentService } from "@/services/consent.service";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  secret: env.BETTER_AUTH_SECRET,
  // ✅ Strip the /api/auth if it's in the env, Better Auth adds it automatically
  baseURL: env.BETTER_AUTH_URL.replace(/\/api\/auth\/?$/, ""),

  trustedOrigins: [
    ...env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()),
    "http://localhost:3000",
    "http://localhost:8081",
    "exp://localhost:8081",
    `http://${process.env.LAN_IP ?? "192.168.106"}:3000`,
    `exp://${process.env.LAN_IP ?? "192.168.106"}:8081`,
    ...(env.NODE_ENV === "development"
      ? ["exp://192.168.106.232:8081", "http://192.168.106.232:3000"]
      : []),
  ],

  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false,
    autoSignIn: true,
  },

  onAPIError: {
    onError: (error, ctx) => {
      logger.error({ error, ctx }, "Better Auth API error");
    },
  },

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // ✅ Handle everything in one place
      if (ctx.path === "/sign-up/email" && ctx.context.newSession) {
        try {
          const user = ctx.context.newSession.user;
          const userId = user.id;

          // 1. Create Trial Subscription
          await subscriptionService.createTrialSubscription(
            userId,
            env.TRIAL_DURATION_DAYS,
          );

          // 2. Record Consent
          const ip = (
            ctx.context.request?.headers?.get("x-forwarded-for") ?? "127.0.0.1"
          )
            .split(",")[0]
            ?.trim();
          const ua =
            ctx.context.request?.headers?.get("user-agent") ?? "unknown";

          await consentService.recordConsent(userId, ip, ua);

          logger.info({ userId }, "Post-signup: Trial + Consent created");
        } catch (error) {
          // We log but don't throw, so the user still gets signed in
          logger.error({ error }, "Post-signup background tasks failed");
        }
      }
    }),
  },

  // 🛡️ REMOVED: The "handler" block. This was likely causing the 500 error
  // because it was interfering with the internal response cycle.

  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
  },
});
