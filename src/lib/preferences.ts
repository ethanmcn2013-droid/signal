import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  CADENCES,
  type Cadence,
  type UserPreferences,
  userPreferences,
} from "./db/schema";
import { generateUnsubscribeToken } from "./email/tokens";

export class NotSignedInError extends Error {
  constructor() {
    super("Not signed in");
  }
}

function isCadence(value: unknown): value is Cadence {
  return typeof value === "string" && (CADENCES as readonly string[]).includes(value);
}

export async function getOrCreatePreferences(): Promise<UserPreferences> {
  const { userId } = await auth();
  if (!userId) throw new NotSignedInError();

  const existing = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
  if (existing[0]) return existing[0];

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  if (!email) {
    throw new Error("Signed-in user has no primary email address on Clerk.");
  }

  const now = Date.now();
  const row = {
    userId,
    email,
    cadence: "weekly" as const,
    unsubscribeToken: generateUnsubscribeToken(),
    lastSentAt: null,
    createdAt: now,
    updatedAt: now,
  };
  // Two concurrent first-loads (e.g. settings + brief tabs racing)
  // both miss the SELECT above; ON CONFLICT DO NOTHING makes the
  // loser a no-op instead of a PK crash. Re-select so we return the
  // row that actually persisted, whichever request won.
  await db
    .insert(userPreferences)
    .values(row)
    .onConflictDoNothing({ target: userPreferences.userId });
  const persisted = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
  return persisted[0] ?? row;
}

export async function setCadence(cadence: Cadence): Promise<UserPreferences> {
  if (!isCadence(cadence)) {
    throw new Error(`Invalid cadence: ${cadence}`);
  }
  const current = await getOrCreatePreferences();
  await db
    .update(userPreferences)
    .set({ cadence, updatedAt: Date.now() })
    .where(eq(userPreferences.userId, current.userId));
  return { ...current, cadence, updatedAt: Date.now() };
}

export async function unsubscribeByToken(
  token: string,
): Promise<{ ok: true; email: string } | { ok: false }> {
  const rows = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.unsubscribeToken, token))
    .limit(1);
  const row = rows[0];
  if (!row) return { ok: false };

  await db
    .update(userPreferences)
    .set({
      cadence: "off",
      // Rotate the token so this URL can't be replayed.
      unsubscribeToken: generateUnsubscribeToken(),
      updatedAt: Date.now(),
    })
    .where(eq(userPreferences.userId, row.userId));
  return { ok: true, email: row.email };
}

/**
 * Read-only token lookup, used by the human-facing /u/[token] page
 * to show a confirmation step BEFORE mutating. Side-effect-free so
 * Slack link unfurls, AV scanners, and image preloaders can't silently
 * unsubscribe a user just by following the URL.
 */
export async function lookupByToken(
  token: string,
): Promise<{ ok: true; email: string } | { ok: false }> {
  const rows = await db
    .select({ email: userPreferences.email })
    .from(userPreferences)
    .where(eq(userPreferences.unsubscribeToken, token))
    .limit(1);
  const row = rows[0];
  if (!row) return { ok: false };
  return { ok: true, email: row.email };
}
