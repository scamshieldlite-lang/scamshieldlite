import rateLimit from "express-rate-limit";
import { env } from "../utils/env";

// General API rate limit — applied to all routes
export const apiRateLimiter = rateLimit({
  windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS),
  max: parseInt(env.RATE_LIMIT_MAX_REQUESTS),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests. Please slow down.",
  },
});

// Stricter limit for scan endpoint — AI calls are expensive
export const scanRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // max 5 scans per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Scan limit reached. Please wait before scanning again.",
  },
});
