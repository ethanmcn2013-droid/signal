import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { analyticsUsers } from "@/server/db/schema";
import type { AnalyticsUser } from "@/server/db/schema";

/**
 * Onboarding-relevant prefs DB queries.
 *
 * Kept here (not in actions.ts) so server components can read prefs
 * without going through the action runtime. Actions should only be
 * the *write* side of onboarding.
 */

export async function getAnalyticsUser(
  clerkId: string,
): Promise<AnalyticsUser | null> {
  const rows = await db
    .select()
    .from(analyticsUsers)
    .where(eq(analyticsUsers.clerkId, clerkId))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * True when the user has completed the onboarding flow at least once
 * (prefs row exists AND a workspace link is set).
 */
export async function isOnboarded(clerkId: string): Promise<boolean> {
  const user = await getAnalyticsUser(clerkId);
  return Boolean(user?.linkedWorkspaceId);
}
