/**
 * server/briefing/read-state.ts — Per-user read state for the engine.
 *
 * Two concerns, both fail-safe (a missing table or a transient DB
 * error degrades to "no read state" — the briefing still builds):
 *
 *  1. Dismissals. The reader's "Not really" taps (briefing_feedback,
 *     verdict = not-useful) are read back so a dismissal sticks. The
 *     UI has promised "I'll show less of this" since the control
 *     shipped; this module is what makes the promise true.
 *
 *  2. Surfacing history. Consecutive-day runs per (item, trigger) so
 *     carry-overs age honestly ("still waiting — day 3") and sort
 *     below fresh items (PRODUCT.md §5.3 de-emphasis).
 *
 * Day arithmetic is UTC day numbers — the same clock the engine's
 * dayRotation uses. Good enough for v1's single 06:00 UTC cron;
 * per-timezone day boundaries arrive with the per-TZ cron.
 */

import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { briefingFeedback, surfacedItems } from "../db/schema";

const DAY = 86_400_000;

/** UTC day number for a unix-ms timestamp. */
export function utcDay(now: number): number {
  return Math.floor(now / DAY);
}

/**
 * Keys the reader has dismissed, shaped for buildBriefing's
 * ReadState.suppressed: `${triggerId}:${itemKey}`, or `*:${itemKey}`
 * when the feedback row predates trigger recording (dismisses the
 * item under every trigger).
 */
export async function getDismissedKeys(
  clerkId: string,
): Promise<Set<string>> {
  try {
    const rows = await db
      .select({
        itemKey: briefingFeedback.itemKey,
        triggerId: briefingFeedback.triggerId,
      })
      .from(briefingFeedback)
      .where(
        and(
          eq(briefingFeedback.clerkId, clerkId),
          eq(briefingFeedback.verdict, "not-useful"),
        ),
      );
    return new Set(
      rows.map((r) => `${r.triggerId ?? "*"}:${r.itemKey}`),
    );
  } catch (err) {
    console.warn("[briefing-read-state] dismissals unavailable:", String(err));
    return new Set();
  }
}

/**
 * Consecutive-day ages for the user's previously surfaced items,
 * keyed `${triggerId}:${itemKey}`, valued as the age *including
 * today*: a row last surfaced yesterday with a 2-day run reads as
 * day 3 if it surfaces again today. Runs broken by a quiet day
 * reset to 1 (the item left the brief and came back — fresh).
 */
export async function getSurfacedAges(
  clerkId: string,
  now: number,
): Promise<Map<string, number>> {
  const today = utcDay(now);
  try {
    const rows = await db
      .select({
        itemKey: surfacedItems.itemKey,
        triggerId: surfacedItems.triggerId,
        lastDay: surfacedItems.lastDay,
        runDays: surfacedItems.runDays,
      })
      .from(surfacedItems)
      .where(eq(surfacedItems.clerkId, clerkId));

    const ages = new Map<string, number>();
    for (const row of rows) {
      const age =
        row.lastDay === today
          ? row.runDays // same-day reload — already counted
          : row.lastDay === today - 1
            ? row.runDays + 1 // continues the run
            : 1; // run broken — fresh again
      ages.set(`${row.triggerId}:${row.itemKey}`, age);
    }
    return ages;
  } catch (err) {
    console.warn("[briefing-read-state] ages unavailable:", String(err));
    return new Map();
  }
}

/**
 * Record today's surfaced (item, trigger) pairs, extending or
 * resetting each run. Called after the build with the items that
 * actually rendered (attention + risks — the aging blocks).
 */
export async function recordSurfaced(
  clerkId: string,
  items: ReadonlyArray<{ itemKey: string; triggerId: string }>,
  now: number,
): Promise<void> {
  if (items.length === 0) return;
  const today = utcDay(now);
  try {
    await Promise.all(
      items.map(async ({ itemKey, triggerId }) => {
        const existing = await db
          .select({
            lastDay: surfacedItems.lastDay,
            runDays: surfacedItems.runDays,
            firstDay: surfacedItems.firstDay,
          })
          .from(surfacedItems)
          .where(
            and(
              eq(surfacedItems.clerkId, clerkId),
              eq(surfacedItems.itemKey, itemKey),
              eq(surfacedItems.triggerId, triggerId),
            ),
          )
          .limit(1);

        const row = existing[0];
        if (row?.lastDay === today) return; // already recorded today

        const continues = row?.lastDay === today - 1;
        await db
          .insert(surfacedItems)
          .values({
            clerkId,
            itemKey,
            triggerId,
            firstDay: continues ? row.firstDay : today,
            lastDay: today,
            runDays: continues ? row.runDays + 1 : 1,
          })
          .onConflictDoUpdate({
            target: [
              surfacedItems.clerkId,
              surfacedItems.itemKey,
              surfacedItems.triggerId,
            ],
            set: {
              firstDay: continues ? row!.firstDay : today,
              lastDay: today,
              runDays: continues ? row!.runDays + 1 : 1,
            },
          });
      }),
    );
  } catch (err) {
    console.warn("[briefing-read-state] surfacing not recorded:", String(err));
  }
}
