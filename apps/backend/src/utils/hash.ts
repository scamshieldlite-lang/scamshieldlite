// apps/backend/src/utils/hash.ts

import { createHash } from "crypto";

/**
 * One-way hash of an IP address.
 * Allows rate limiting and abuse detection without storing raw PII.
 * Uses SHA-256 — fast, collision-resistant, not reversible.
 */
export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

/**
 * Hash any string value — used for fingerprints, tokens, etc.
 * when you need a fixed-length, safe representation.
 */
export function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
