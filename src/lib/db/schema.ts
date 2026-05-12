import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const CADENCES = ["daily", "weekly", "off"] as const;
export type Cadence = (typeof CADENCES)[number];

export const userPreferences = sqliteTable("user_preferences", {
  // Clerk user id — the source of truth for who this is.
  userId: text("user_id").primaryKey(),
  // Email of record. We store it because Clerk may rotate primary email
  // and we want a stable destination for the briefing.
  email: text("email").notNull(),
  // One of CADENCES.
  cadence: text("cadence").notNull().default("weekly"),
  // Opaque token used for one-click unsubscribe (no auth).
  // Rotates on every email send to defeat scraped/forwarded links.
  unsubscribeToken: text("unsubscribe_token").notNull().unique(),
  // When did we last successfully send? null = never.
  lastSentAt: integer("last_sent_at"),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;
