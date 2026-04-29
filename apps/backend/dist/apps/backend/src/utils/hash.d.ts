/**
 * One-way hash of an IP address.
 * Allows rate limiting and abuse detection without storing raw PII.
 * Uses SHA-256 — fast, collision-resistant, not reversible.
 */
export declare function hashIp(ip: string): string;
/**
 * Hash any string value — used for fingerprints, tokens, etc.
 * when you need a fixed-length, safe representation.
 */
export declare function hashValue(value: string): string;
//# sourceMappingURL=hash.d.ts.map