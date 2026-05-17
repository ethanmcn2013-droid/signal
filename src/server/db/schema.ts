import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";

/**
 * Analytics prefs DB schema.
 *
 * Scope: per-user prefs. Owns the link from a Clerk user to a Signal
 * Tasks workspace, plus the IANA timezone captured at onboarding so
 * the daily briefing fires at the right local hour (PRODUCT.md §11
 * open question 1, resolved here as "browser TZ at onboarding").
 *
 * Analytics never writes to the Tasks DB it reads from. This is its
 * only persistence surface in v1; cadence/channel/etc preferences
 * land here in Cycle 6.5 when the briefing renderer ships.
 */
export const analyticsUsers = sqliteTable("analytics_users", {
  /** Clerk user id (`user_2abc…`). Stable across sessions. */
  clerkId: text("clerk_id").primaryKey(),
  /** Signal Tasks workspace id this user's briefing reads. Null until
   *  the user completes onboarding. Once set, the briefing pipeline
   *  uses this id when calling `dataSource.read()`. */
  linkedWorkspaceId: text("linked_workspace_id"),
  /** IANA timezone string (e.g. "Europe/Dublin"). Captured from the
   *  browser at onboarding via Intl.DateTimeFormat().resolvedOptions().
   *  Null until the user completes onboarding. */
  timezone: text("timezone"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type AnalyticsUser = typeof analyticsUsers.$inferSelect;

/**
 * Per-user, per-trigger phrasing rotation cursor.
 *
 * Cycle 6.4 (Attention engine v1) keeps the prose library from
 * repeating: each time a trigger fires for a user, we advance
 * `lastIndex` so the next fire picks the next phrasing. PRODUCT.md
 * §9 revisit-trigger b: "no phrasing twice in 14 days for the same
 * user/trigger" — round-robin rotation across a 4–8 entry library
 * cycles in 4–8 fires, well inside 14 days for daily cadence.
 *
 * `lastFiredAt` is recorded so a future cycle can detect cold
 * triggers (e.g. reset to a fresh phrasing if the trigger hasn't
 * fired in months) without changing the schema.
 */
export const phrasingRotations = sqliteTable(
  "phrasing_rotations",
  {
    /** Clerk user id. */
    clerkId: text("clerk_id").notNull(),
    /** Trigger id (e.g. "blocked", "overdue"). String-typed to keep
     *  the DB layer free of the trigger union. */
    triggerId: text("trigger_id").notNull(),
    /** Index into the trigger's phrasings array. Round-robins. */
    lastIndex: integer("last_index").notNull().default(0),
    /** Unix-seconds timestamp of the last fire. */
    lastFiredAt: integer("last_fired_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [primaryKey({ columns: [t.clerkId, t.triggerId] })],
);

export type PhrasingRotation = typeof phrasingRotations.$inferSelect;
