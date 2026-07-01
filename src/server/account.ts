import "server-only";
import { db as prefsDb } from "@/server/db";
import { db as libDb } from "@/lib/db";
import { eraseAccountData } from "@/server/account-erasure";

/**
 * Hard-delete the user's footprint in Signal' Turso footprint.
 *
 * Called by `POST /api/account/delete` BEFORE the Clerk admin delete.
 *
 * Signal is the ONLY suite product that talks to two distinct Turso
 * databases:
 *   - `@/server/db` (env `TURSO_DATABASE_URL`) — the analytics-prefs DB
 *     owning `analyticsUsers`, `phrasingRotations`, and `briefingFeedback`.
 *   - `@/lib/db` (env `TURSO_ANALYTICS_DATABASE_URL`) — the email
 *     subscription DB owning `userPreferences`.
 *
 * The erasure itself lives in `account-erasure.ts` as a db-injected pure
 * function (both handles passed in) so it can be exercised end-to-end
 * against in-memory libSQL DBs (see account-erasure.test.ts). It clears
 * all four user-keyed tables across both DBs — including `briefingFeedback`,
 * which a prior version missed.
 *
 * Idempotent: re-running after partial failure is safe.
 */
export async function deleteAccountForUser(clerkId: string): Promise<void> {
  await eraseAccountData(prefsDb, libDb, clerkId);
}
