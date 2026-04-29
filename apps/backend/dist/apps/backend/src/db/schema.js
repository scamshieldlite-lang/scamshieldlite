// src/db/schema.ts
import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, pgEnum, index, uniqueIndex, } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
// ─── Enums ────────────────────────────────────────────────────────────────────
export const subscriptionStatusEnum = pgEnum("subscription_status", [
    "trialing",
    "active",
    "expired",
    "cancelled",
]);
export const riskLevelEnum = pgEnum("risk_level", [
    "Likely Safe",
    "Suspicious",
    "Likely Scam",
]);
export const inputTypeEnum = pgEnum("input_type", ["text", "screenshot"]);
// ─── Better Auth Tables ───────────────────────────────────────────────────────
export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});
export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .$onUpdate(() => new Date())
        .notNull(),
    ipAddress: text("ip_address"), // hashed instead of raw IP
    userAgent: text("user_agent"),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
}, (table) => [index("session_user_id_idx").on(table.userId)]);
export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .$onUpdate(() => new Date())
        .notNull(),
}, (table) => [index("account_user_id_idx").on(table.userId)]);
export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
}, (table) => [index("verification_identifier_idx").on(table.identifier)]);
// ─── Subscriptions ────────────────────────────────────────────────────────────
export const subscriptions = pgTable("subscriptions", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    status: subscriptionStatusEnum("status").notNull().default("trialing"),
    planId: text("plan_id"),
    trialStart: timestamp("trial_start", { withTimezone: true })
        .defaultNow()
        .notNull(),
    trialEnd: timestamp("trial_end", { withTimezone: true }).notNull(),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    playPurchaseToken: text("play_purchase_token"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
}, (table) => ({
    userIdIdx: uniqueIndex("subscriptions_user_id_idx").on(table.userId),
    statusIdx: index("subscriptions_status_idx").on(table.status),
}));
// ─── Scans ────────────────────────────────────────────────────────────────────
export const scans = pgTable("scans", {
    id: uuid("id").primaryKey().defaultRandom(),
    // Optional → supports guest users
    userId: text("user_id").references(() => user.id, {
        onDelete: "set null",
    }),
    deviceFingerprint: text("device_fingerprint"),
    inputType: inputTypeEnum("input_type").notNull(),
    inputLength: integer("input_length").notNull(),
    scrubbedInput: text("scrubbed_input").notNull(),
    riskScore: integer("risk_score").notNull(),
    riskLevel: riskLevelEnum("risk_level").notNull(),
    scamType: text("scam_type"),
    indicatorsDetected: jsonb("indicators_detected").notNull().default([]),
    explanation: text("explanation").notNull(),
    recommendation: text("recommendation").notNull(),
    aiProvider: text("ai_provider").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
}, (table) => ({
    userIdx: index("scans_user_idx").on(table.userId),
    deviceIdx: index("scans_device_idx").on(table.deviceFingerprint),
    createdAtIdx: index("scans_created_at_idx").on(table.createdAt),
    userCreatedIdx: index("scans_user_created_idx").on(table.userId, table.createdAt),
}));
// ─── Reported Scams ───────────────────────────────────────────────────────────
export const reportedScams = pgTable("reported_scams", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => user.id, {
        onDelete: "set null",
    }),
    deviceFingerprint: text("device_fingerprint"),
    scrubbedInput: text("scrubbed_input").notNull(),
    riskScore: integer("risk_score").notNull(),
    scamType: text("scam_type"),
    indicatorsDetected: jsonb("indicators_detected").notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
}, (table) => ({
    typeIdx: index("reported_scams_type_idx").on(table.scamType, table.createdAt),
}));
// ─── Devices ──────────────────────────────────────────────────────────────────
export const devices = pgTable("devices", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    deviceId: text("device_id").notNull(),
    fcmToken: text("fcm_token"),
    deviceName: text("device_name"),
    platform: text("platform").notNull(),
    osVersion: text("os_version"),
    appVersion: text("app_version"),
    isActive: boolean("is_active").notNull().default(true),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
}, (table) => ({
    userDeviceIdx: uniqueIndex("devices_user_device_idx").on(table.userId, table.deviceId),
    userIdx: index("devices_user_idx").on(table.userId),
    lastSeenIdx: index("devices_last_seen_idx").on(table.lastSeenAt),
}));
// ─── Audit Logs (Rate Limiting + Analytics) ───────────────────────────────────
export const auditLogs = pgTable("audit_logs", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id"),
    deviceFingerprint: text("device_fingerprint"),
    ipHash: text("ip_hash"),
    action: text("action").notNull(),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
}, (table) => ({
    userIdx: index("audit_logs_user_idx").on(table.userId),
    deviceIdx: index("audit_logs_device_idx").on(table.deviceFingerprint),
    createdIdx: index("audit_logs_created_idx").on(table.createdAt),
}));
// ─── Consent Records ─────────────────────────────────────────────
// Tracks when a user accepted the Terms and Privacy Policy.
// Required for GDPR/NDPR compliance evidence.
export const consentRecords = pgTable("consent_records", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    termsVersion: text("terms_version").notNull(), // e.g. "1.0"
    privacyVersion: text("privacy_version").notNull(), // e.g. "1.0"
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
}, (table) => ({
    userIdx: index("consent_records_user_idx").on(table.userId),
    createdIdx: index("consent_records_created_idx").on(table.createdAt),
}));
// ─── Privacy Settings ─────────────────────────────────────────────
// Per-user privacy preferences.
// One row per user — upsert on update.
export const privacySettings = pgTable("privacy_settings", {
    userId: text("user_id")
        .primaryKey()
        .references(() => user.id, { onDelete: "cascade" }),
    analyticsEnabled: boolean("analytics_enabled").notNull().default(true),
    scanHistoryEnabled: boolean("scan_history_enabled").notNull().default(true),
    crashReportingEnabled: boolean("crash_reporting_enabled")
        .notNull()
        .default(true),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});
// ─── Relations ───────────────────────────────────────────────────────────────
export const userRelations = relations(user, ({ many, one }) => ({
    sessions: many(session),
    accounts: many(account),
    subscription: one(subscriptions, {
        fields: [user.id],
        references: [subscriptions.userId],
    }),
    scans: many(scans),
    devices: many(devices),
}));
export const scanRelations = relations(scans, ({ one }) => ({
    user: one(user, {
        fields: [scans.userId],
        references: [user.id],
    }),
}));
export const consentRecordRelations = relations(consentRecords, ({ one }) => ({
    user: one(user, {
        fields: [consentRecords.userId],
        references: [user.id],
    }),
}));
export const privacySettingsRelations = relations(privacySettings, ({ one }) => ({
    user: one(user, {
        fields: [privacySettings.userId],
        references: [user.id],
    }),
}));
//# sourceMappingURL=schema.js.map