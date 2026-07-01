/**
 * server/briefing/build-for-user.ts — Per-user briefing orchestrator.
 *
 * Wraps the pure `buildBriefing` pipeline with the user-bound concerns:
 *  - resolves which Tasks workspace this Clerk user is briefing on
 *    (from the analytics_users prefs table populated at onboarding)
 *  - loads the user's phrasing-rotation cursor before the build
 *  - bumps the cursor for each trigger that actually fired
 *
 * The renderer (Cycle 6.5) and any cron job will call this — the
 * underlying buildBriefing stays pure for testability.
 */

import { eq } from "drizzle-orm";
import { db } from "../db";
import { analyticsUsers } from "../db/schema";
import type { Cadence } from "@/lib/db/schema";
import { dataSource } from "@/lib/data/source";
import { buildBriefing } from "@/lib/briefing/build";
import type { Briefing } from "@/lib/briefing/types";
import type { BriefingSource } from "@/lib/briefing/source";
import type { TriggerId } from "@/lib/triggers/types";
import { getRotations, bumpRotations } from "./rotation";
import { getBriefingEmptyCopy } from "@/lib/onboarding/personalization";
import { isDemoMode } from "@/lib/access-mode";
import { mockBriefingSource } from "@/lib/briefing/mock-source";

export type BriefingForUserResult =
  | { kind: "ok"; briefing: Briefing }
  | { kind: "no-workspace" };

/**
 * Build a briefing for a Clerk user at the given cadence.
 *
 * Returns `no-workspace` when the user hasn't completed onboarding —
 * the renderer should show the same brand-coherent empty state the
 * /app/onboarding flow ships, not a placeholder briefing.
 */
export async function buildBriefingForUser(opts: {
  clerkId: string;
  cadence: Cadence;
}): Promise<BriefingForUserResult> {
  const { clerkId } = opts;

  // Demo/Review: build a real briefing from the in-memory Wedding 2026 mock
  // signals via the pure buildBriefing engine. No DB: no workspace lookup, no
  // rotation read/write. The product reads exactly as it will in production —
  // only the data is synthetic.
  if (isDemoMode()) {
    const briefing = await buildBriefing(mockBriefingSource, {
      userId: clerkId || "demo-user",
      email: "",
    });
    const emptyCopy = getBriefingEmptyCopy({ primaryUseCase: "venue" });
    return {
      kind: "ok",
      briefing: {
        ...briefing,
        emptyStateHeadline: emptyCopy.headline,
        emptyStateBody: emptyCopy.body,
      },
    };
  }

  const rows = await db
    .select({ workspaceId: analyticsUsers.linkedWorkspaceId })
    .from(analyticsUsers)
    .where(eq(analyticsUsers.clerkId, clerkId))
    .limit(1);

  const workspaceId = rows[0]?.workspaceId ?? null;
  if (!workspaceId) return { kind: "no-workspace" };

  const onboarding =
    (await dataSource.getWorkspaceOnboarding?.(workspaceId)) ?? null;
  const emptyCopy = getBriefingEmptyCopy({
    primaryUseCase: onboarding?.primaryUseCase,
  });

  const rotationsBefore = await getRotations(clerkId);

  // Adapt the DataSource (workspace-keyed) into the BriefingSource
  // (user-context-keyed) interface that buildBriefing expects.
  // The rotation lookup and self-user id are wired via the day-rotation
  // helper inside buildBriefing; cadence is informational only at the
  // orchestrator level (the cron already filters by cadence before
  // calling buildBriefingForUser).
  const source: BriefingSource = {
    getSignalsForUser: async (_ctx) => {
      const work = await dataSource.read(workspaceId);
      // Flatten TaskReads into TaskSignals. The data/source layer
      // maps Tasks lanes → Signal Status; we translate back to
      // the TaskSignal contract buildBriefing expects.
      return work.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        lane: ((): import("@/lib/briefing/types").Lane => {
          if (t.status === "shipped") return "shipped";
          if (t.status === "in-flight") return "in-flight";
          if (t.status === "blocked") return "in-flight";
          if (t.status === "next") return "next";
          return "next";
        })(),
        priority: 2 as const,
        dueAt: t.dueDate ? new Date(t.dueDate).getTime() : null,
        idleDays: (() => {
          const last = new Date(t.lastActivityAt).getTime();
          return Math.floor((Date.now() - last) / 86_400_000);
        })(),
        commentCount: 0,
        blockedBy: t.blockedBy,
        sourceLabel: `Tasks · ${workspaceId}`,
        movedToShippedAt: t.status === "shipped"
          ? new Date(t.lastStatusChangeAt).getTime()
          : null,
      }));
    },
  };

  const briefing = await buildBriefing(source, {
    userId: clerkId,
    email: "",
  });

  // Advance rotation only for triggers that actually surfaced.
  const fired = new Set<TriggerId>();
  const allItems = [
    ...briefing.needsAttention,
    ...briefing.movingWell,
    ...briefing.quietRisks,
  ];
  for (const item of allItems) {
    // item.trigger is TriggerKind; rotation table uses TriggerId.
    // The value sets are disjoint types but overlap at runtime for the
    // triggers that bridge both pipelines. Cast is safe at runtime.
    fired.add(item.trigger as unknown as TriggerId);
  }
  await bumpRotations(clerkId, Array.from(fired));

  return {
    kind: "ok",
    briefing: {
      ...briefing,
      emptyStateHeadline: emptyCopy.headline,
      emptyStateBody: emptyCopy.body,
    },
  };
}
