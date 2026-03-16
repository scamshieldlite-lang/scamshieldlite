// src/db/schema.ts

import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "expired",
  "cancelled",
]);

export const riskLevelEnum = pgEnum("risk_level", [
  "Safe",
  "Medium Risk",
  "High Risk",
]);

export const inputTypeEnum = pgEnum("input_type", ["text", "screenshot"]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
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
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// ─── Subscriptions ────────────────────────────────────────────────────────────
// References Better Auth's `user` table via userId

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // FK → Better Auth `user.id`
    userId: text("user_id").notNull(),
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
      .notNull(),
  },
  (table) => ({
    userIdIdx: uniqueIndex("subscriptions_user_id_idx").on(table.userId),
    statusIdx: index("subscriptions_status_idx").on(table.status),
  }),
);

// ─── Scans ────────────────────────────────────────────────────────────────────

export const scans = pgTable(
  "scans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    inputType: inputTypeEnum("input_type").notNull(),

    // Original input length BEFORE scrubbing — never store the raw input
    inputLength: integer("input_length").notNull(),

    // Only PII-scrubbed content is ever persisted
    scrubbedInput: text("scrubbed_input").notNull(),

    riskScore: integer("risk_score").notNull(), // 0–100
    riskLevel: riskLevelEnum("risk_level").notNull(),
    scamType: text("scam_type"),
    indicatorsDetected: jsonb("indicators_detected").notNull().default([]),
    explanation: text("explanation").notNull(),
    recommendation: text("recommendation").notNull(),
    aiProvider: text("ai_provider").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("scans_user_id_idx").on(table.userId),
    createdAtIdx: index("scans_created_at_idx").on(table.createdAt),
    // Optimised for history queries: WHERE user_id = ? ORDER BY created_at DESC
    userCreatedIdx: index("scans_user_created_idx").on(
      table.userId,
      table.createdAt,
    ),
    // Useful for abuse detection queries: WHERE input_length > N
    inputLengthIdx: index("scans_input_length_idx").on(table.inputLength),
  }),
);

// ─── Devices ──────────────────────────────────────────────────────────────────

export const devices = pgTable(
  "devices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),

    // Unique hardware/install identifier (Expo generates this)
    deviceId: text("device_id").notNull(),

    // Firebase Cloud Messaging token for push notifications
    // Rotates periodically — always upsert, never insert blindly
    fcmToken: text("fcm_token"),

    // Display info for the "active devices" security screen
    deviceName: text("device_name"), // e.g. "Samsung Galaxy S22"
    platform: text("platform").notNull(), // 'android' | 'ios'
    osVersion: text("os_version"), // e.g. "Android 14"
    appVersion: text("app_version"), // e.g. "1.0.3" — track adoption

    isActive: boolean("is_active").notNull().default(true),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    // One row per physical device per user — upsert on conflict
    userDeviceIdx: uniqueIndex("devices_user_device_idx").on(
      table.userId,
      table.deviceId,
    ),
    userIdIdx: index("devices_user_id_idx").on(table.userId),
    fcmTokenIdx: index("devices_fcm_token_idx").on(table.fcmToken),
    // Fast lookup of active devices for push notifications
    activeIdx: index("devices_active_idx").on(table.isActive),
  }),
);

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id"), // nullable — pre-auth events (failed logins)
    action: text("action").notNull(),
    // e.g. 'login', 'logout', 'scan_created',
    //      'subscription_started', 'device_registered',
    //      'password_reset', 'account_deleted'
    ipAddress: text("ip_address"),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("audit_logs_user_id_idx").on(table.userId),
    createdAtIdx: index("audit_logs_created_at_idx").on(table.createdAt),
    actionIdx: index("audit_logs_action_idx").on(table.action),
  }),
);

// ─── Type exports ─────────────────────────────────────────────────────────────

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type Scan = typeof scans.$inferSelect;
export type NewScan = typeof scans.$inferInsert;
export type Device = typeof devices.$inferSelect;
export type NewDevice = typeof devices.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

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
  auditLogs: many(auditLogs),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
  user: one(user, {
    fields: [subscriptions.userId],
    references: [user.id],
  }),
}));

export const scanRelations = relations(scans, ({ one }) => ({
  user: one(user, {
    fields: [scans.userId],
    references: [user.id],
  }),
}));

export const deviceRelations = relations(devices, ({ one }) => ({
  user: one(user, {
    fields: [devices.userId],
    references: [user.id],
  }),
}));

export const auditLogRelations = relations(auditLogs, ({ one }) => ({
  user: one(user, {
    fields: [auditLogs.userId],
    references: [user.id],
  }),
}));
