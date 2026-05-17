/**
 * server/briefing/rotation.ts — Per-user phrasing rotation persistence.
 *
 * The attention engine renders insights through a hand-curated prose
 * library (4–8 phrasings per trigger, PRODUCT.md §5.2). This module
 * keeps the rotation cursor per (Clerk user, trigger) so the same
 * sentence doesn't fire twice within the 14-day window PRODUCT.md §9
 * revisit-trigger (b) defines.
 *
 * Strategy: round-robin. With a 4–8 entry library, advancing one slot
 * per fire wraps in 4–8 days for daily cadence — well inside 14d.
 *
 * Plan 6 · Cycle 6.4.
 */

import { eq, sql, inArray, and } from "drizzle-orm";
import { db } from "../db";
import { phrasingRotations } from "../db/schema";
import type { TriggerId } from "@/lib/triggers/types";

/**
 * Read rotation indices for one user. Triggers without a row default
 * to 0. Returned as a partial map keyed by trigger id.
 */
export async function getRotations(
  clerkId: string,
): Promise<Partial<Record<TriggerId, number>>> {
  const rows = await db
    .select({
      triggerId: phrasingRotations.triggerId,
      lastIndex: phrasingRotations.lastIndex,
    })
    .from(phrasingRotations)
    .where(eq(phrasingRotations.clerkId, clerkId));

  const map: Partial<Record<TriggerId, number>> = {};
  for (const row of rows) {
    map[row.triggerId as TriggerId] = row.lastIndex;
  }
  return map;
}

/**
 * Advance rotation indices for the triggers that fired in this run.
 *
 * For each trigger, increment lastIndex by 1 (modulo handled by the
 * picker at render time) and stamp lastFiredAt. New rows are upserted
 * — first-fire users get a row with lastIndex=1 (since 0 was rendered).
 */
export async function bumpRotations(
  clerkId: string,
  firedTriggerIds: TriggerId[],
): Promise<void> {
  if (firedTriggerIds.length === 0) return;

  // Read existing rows for the firing triggers in one query.
  const existing = await db
    .select({
      triggerId: phrasingRotations.triggerId,
      lastIndex: phrasingRotations.lastIndex,
    })
    .from(phrasingRotations)
    .where(
      and(
        eq(phrasingRotations.clerkId, clerkId),
        inArray(phrasingRotations.triggerId, firedTriggerIds),
      ),
    );

  const existingMap = new Map(existing.map((r) => [r.triggerId, r.lastIndex]));

  // libsql doesn't support multi-row ON CONFLICT updates ergonomically
  // through drizzle's batch helpers — issue per-row upserts. The set
  // is bounded by the trigger count (≤10), so this is fine.
  for (const triggerId of firedTriggerIds) {
    const current = existingMap.get(triggerId);
    if (current === undefined) {
      await db.insert(phrasingRotations).values({
        clerkId,
        triggerId,
        lastIndex: 1,
        lastFiredAt: new Date(),
      });
    } else {
      await db
        .update(phrasingRotations)
        .set({
          lastIndex: current + 1,
          lastFiredAt: new Date(),
        })
        .where(
          and(
            eq(phrasingRotations.clerkId, clerkId),
            eq(phrasingRotations.triggerId, triggerId),
          ),
        );
    }
  }
}

/**
 * Build a (triggerId) => index lookup function from a pre-loaded map.
 * The buildBriefing pipeline expects sync rotationLookup; the caller
 * loads rotations once via getRotations() and binds them here.
 */
export function rotationLookupFromMap(
  map: Partial<Record<TriggerId, number>>,
): (triggerId: string) => number {
  return (triggerId) => map[triggerId as TriggerId] ?? 0;
}

/** Re-export for convenience — used by tests / dev scripts. */
export { sql };
