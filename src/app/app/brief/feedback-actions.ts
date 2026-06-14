"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { briefingFeedback } from "@/server/db/schema";

export type FeedbackVerdict = "useful" | "not-useful";

/**
 * Record a one-tap verdict on a briefing item (PRODUCT.md §2.4 — the only
 * feedback signal the product collects, used to tune the trigger set).
 *
 * Fail-safe by design: the briefing_feedback table is applied by an operator
 * step (drizzle/0002_briefing_feedback.sql) against the Signal Turso DB. Until
 * that runs — or on any transient write error — this no-ops with a server-side
 * warning. The verdict is never surfaced as an error to the reader; the UI
 * acknowledges the tap optimistically regardless.
 */
export async function recordBriefingFeedback(
  itemKey: string,
  verdict: FeedbackVerdict,
  triggerId?: string,
): Promise<void> {
  if (verdict !== "useful" && verdict !== "not-useful") return;
  if (!itemKey) return;
  try {
    const user = await currentUser();
    if (!user) return;
    const now = new Date();
    await db
      .insert(briefingFeedback)
      .values({
        clerkId: user.id,
        itemKey,
        verdict,
        triggerId: triggerId ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [briefingFeedback.clerkId, briefingFeedback.itemKey],
        set: { verdict, triggerId: triggerId ?? null, updatedAt: now },
      });
  } catch (err) {
    // Table not migrated yet, or a transient write error. Never user-facing.
    console.warn("[briefing-feedback] not recorded:", String(err));
  }
}
