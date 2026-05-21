import "server-only";
import { eq } from "drizzle-orm";
import { db as prefsDb } from "@/server/db";
import { analyticsUsers, phrasingRotations } from "@/server/db/schema";
import { db as libDb } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";

/**
 * Hard-delete the user's footprint in Analytics' Turso footprint.
 *
 * Called by `POST /api/account/delete` BEFORE the Clerk admin delete.
 *
 * Analytics is the ONLY suite product that talks to two distinct
 * Turso databases:
 *   - `@/server/db` (env `TURSO_DATABASE_URL`) — the analytics-prefs
 *     DB that owns `analyticsUsers` (Clerk-id → linked Tasks workspace
 *     + IANA tz) and `phrasingRotations` (per-trigger rotation cursor).
 *   - `@/lib/db` (env `TURSO_ANALYTICS_DATABASE_URL`) — the email
 *     subscription DB that owns `userPreferences` (cadence + the
 *     unsubscribe-token rotation surface).
 *
 * Both clients are imported here so the purge hits both DBs. Missing
 * the second one would leave the user's email subscription record
 * alive — they would keep receiving briefings after deletion.
 *
 * Idempotent: re-running after partial failure is safe.
 */
export async function deleteAccountForUser(clerkId: string): Promise<void> {
  // Prefs DB
  await prefsDb
    .delete(phrasingRotations)
    .where(eq(phrasingRotations.clerkId, clerkId));
  await prefsDb.delete(analyticsUsers).where(eq(analyticsUsers.clerkId, clerkId));

  // Email subscription DB (separate Turso instance)
  await libDb.delete(userPreferences).where(eq(userPreferences.userId, clerkId));
}
