import { eq } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import {
  analyticsUsers,
  briefingFeedback,
  phrasingRotations,
  surfacedItems,
} from "./db/schema";
import * as prefsSchema from "./db/schema";
import { userPreferences } from "../lib/db/schema";
import * as libSchema from "../lib/db/schema";

export type PrefsDb = LibSQLDatabase<typeof prefsSchema>;
export type LibDb = LibSQLDatabase<typeof libSchema>;

/**
 * Hard-delete a user's ENTIRE footprint across Analytics' TWO Turso DBs.
 *
 * GDPR right-to-erasure / App Store 5.1.1(v). Analytics is the only suite
 * product spanning two databases:
 *   - prefs DB (`@/server/db`): `analytics_users`, `phrasing_rotations`,
 *     `briefing_feedback`, `surfaced_items` — all keyed by `clerk_id`.
 *   - email-subscription DB (`@/lib/db`): `user_preferences` (keyed by
 *     `user_id` = clerk id), the unsubscribe-token surface.
 *
 * ── Why this changed ──────────────────────────────────────────────────
 * The previous erasure deleted `analytics_users`, `phrasing_rotations`,
 * and `user_preferences` but MISSED `briefing_feedback` (added later, same
 * `clerk_id` key). A deleted user's per-item feedback rows survived — a
 * GDPR residue. This function deletes every clerk-keyed table across both
 * DBs; any new clerk-keyed table MUST be added here and in
 * account-export.ts in the same change (`surfaced_items` followed this
 * rule when carry-over aging shipped).
 *
 * db-injected so it runs against the production singletons OR in-memory
 * test DBs (see account-erasure.test.ts). Idempotent.
 */
export async function eraseAccountData(
  prefsDatabase: PrefsDb,
  libDatabase: LibDb,
  clerkId: string,
): Promise<void> {
  // Prefs DB — every table keyed by clerk_id.
  await prefsDatabase
    .delete(phrasingRotations)
    .where(eq(phrasingRotations.clerkId, clerkId));
  await prefsDatabase
    .delete(briefingFeedback)
    .where(eq(briefingFeedback.clerkId, clerkId));
  await prefsDatabase
    .delete(surfacedItems)
    .where(eq(surfacedItems.clerkId, clerkId));
  await prefsDatabase
    .delete(analyticsUsers)
    .where(eq(analyticsUsers.clerkId, clerkId));

  // Email subscription DB (separate Turso instance).
  await libDatabase
    .delete(userPreferences)
    .where(eq(userPreferences.userId, clerkId));
}
