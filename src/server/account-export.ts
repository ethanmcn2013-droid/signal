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
 * GDPR Art. 20 (data portability), assemble everything Analytics holds for
 * a user across its TWO Turso DBs (prefs + email-subscription), keyed by
 * Clerk userId. Counterpart to `account-erasure.ts`; same db-injection seam
 * so it's testable (see account-export.test.ts).
 *
 * SECURITY: `user_preferences.unsubscribe_token` is OMITTED, it's an opaque
 * action credential (one-click unsubscribe, no auth), not user content.
 * Email + cadence are exported; the token is not.
 */
export async function exportAccountData(
  prefsDatabase: PrefsDb,
  libDatabase: LibDb,
  clerkId: string,
) {
  const [users, rotations, feedback, surfaced, prefs] = await Promise.all([
    prefsDatabase
      .select()
      .from(analyticsUsers)
      .where(eq(analyticsUsers.clerkId, clerkId)),
    prefsDatabase
      .select()
      .from(phrasingRotations)
      .where(eq(phrasingRotations.clerkId, clerkId)),
    prefsDatabase
      .select()
      .from(briefingFeedback)
      .where(eq(briefingFeedback.clerkId, clerkId)),
    prefsDatabase
      .select()
      .from(surfacedItems)
      .where(eq(surfacedItems.clerkId, clerkId)),
    libDatabase
      .select({
        userId: userPreferences.userId,
        email: userPreferences.email,
        cadence: userPreferences.cadence,
        lastSentAt: userPreferences.lastSentAt,
        createdAt: userPreferences.createdAt,
        updatedAt: userPreferences.updatedAt,
      })
      .from(userPreferences)
      .where(eq(userPreferences.userId, clerkId)),
  ]);

  return {
    product: "analytics" as const,
    exportedAt: new Date().toISOString(),
    userId: clerkId,
    account: users[0] ?? null,
    phrasingRotations: rotations,
    briefingFeedback: feedback,
    surfacedItems: surfaced,
    // Token-free by design, see the security note above.
    emailSubscription: prefs[0] ?? null,
  };
}
