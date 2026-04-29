import pino from "pino";
import { env } from "./env.js";
export const logger = pino({
    // Name helps identify the source if you aggregate logs later
    name: "scam-detection-api",
    level: env.NODE_ENV === "production" ? "info" : "debug",
    // Security: Redact sensitive fields so they never show up in logs
    redact: {
        paths: [
            "email",
            "password",
            "secret",
            "token",
            "DATABASE_URL",
            "BETTER_AUTH_SECRET",
        ],
        censor: "[REDACTED]",
    },
    ...(env.NODE_ENV !== "production" && {
        transport: {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "SYS:standard", // Shows full date/time in dev
                ignore: "pid,hostname",
            },
        },
    }),
});
//# sourceMappingURL=logger.js.map