import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js";
import * as schema from "../db/schema.js";
import { env } from "../utils/env.js";
import { logger } from "../utils/logger.js";
import { subscriptionService } from "../services/subscription.service.js";
import { createAuthMiddleware } from "better-auth/api";
import { consentService } from "../services/consent.service.js";
import { bearer } from "better-auth/plugins";
export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    secret: env.BETTER_AUTH_SECRET,
    // ✅ Strip the /api/auth if it's in the env, Better Auth adds it automatically
    baseURL: env.BETTER_AUTH_URL.replace(/\/api\/auth\/?$/, ""),
    trustedOrigins: [
        "http://192.168.43.92:3000",
        "http://192.168.43.92:8081",
        "exp://192.168.43.92:8081",
        "http://localhost:3000",
        "http://localhost:8081",
        "exp://localhost:8081",
    ],
    plugins: [bearer()],
    session: {
        expiresIn: 60 * 60 * 24 * 30,
        updateAge: 60 * 60 * 24,
        cookieCache: { enabled: true, maxAge: 60 * 5 },
    },
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
        requireEmailVerification: false,
        autoSignIn: false,
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
                    logger.info({ availableKeys: Object.keys(ctx) }, "Post-signup hook context keys");
                    const userId = ctx.context.newSession?.user?.id ??
                        ctx.context.user?.id ??
                        ctx.context.newUser?.user?.id;
                    if (!userId) {
                        logger.warn({
                            hasNewSession: !!ctx.context.newSession,
                            contextKeys: Object.keys(ctx.context),
                        }, "Post-signup hook: could not extract userId");
                        return;
                    }
                    // const user = ctx.context.newSession.user;
                    // const userId = user.id;
                    // 1. Create Trial Subscription
                    await subscriptionService.createTrialSubscription(userId, env.TRIAL_DURATION_DAYS);
                    // 2. Record Consent
                    const ip = (ctx.context.request?.headers?.get("x-forwarded-for") ?? "127.0.0.1")
                        .split(",")[0]
                        ?.trim();
                    const ua = ctx.context.request?.headers?.get("user-agent") ?? "unknown";
                    await consentService.recordConsent(userId, ip, ua);
                    logger.info({ userId }, "Post-signup: Trial + Consent created");
                }
                catch (error) {
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
        disableCheckOrigin: true,
    },
});
//# sourceMappingURL=auth.js.map