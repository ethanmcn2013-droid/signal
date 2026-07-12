/**
 * server/briefing/build-for-user.ts, Per-user briefing orchestrator.
 *
 * Wraps the pure `buildBriefing` pipeline with the user-bound concerns:
 *  - resolves which Tasks workspace this Clerk user is briefing on
 *    (from the analytics_users prefs table populated at onboarding)
 *  - loads the user's phrasing-rotation cursor before the build
 *  - bumps the cursor for each trigger that actually fired
 *
 * The renderer (Cycle 6.5) and any cron job will call this, the
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
import { bumpRotations } from "./rotation";
import {
  getDismissedKeys,
  getSurfacedAges,
  recordSurfaced,
} from "./read-state";
import { getBriefingEmptyCopy } from "@/lib/onboarding/personalization";
import { isDemoMode } from "@/lib/access-mode";
import {
  mockBriefingSource,
  mockPlanningPeriodBriefingSource,
} from "@/lib/briefing/mock-source";
import {
  authorizeSignalScope,
  listPlanningCatalogForUser,
  planningPeriodsEnabled,
  type AuthorizedSignalScope,
  type PlanningCatalog,
  type SignalScope,
} from "@/lib/planning-periods/scope";
import {
  calendarDayDifference,
  dateOnlyToTimestamp,
} from "@/lib/briefing/calendar-time";

export type BriefingForUserResult =
  | {
      kind: "ok";
      briefing: Briefing;
      authorizedScope: AuthorizedSignalScope;
      catalog: PlanningCatalog;
    }
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
  scope?: SignalScope;
}): Promise<BriefingForUserResult> {
  const { clerkId } = opts;

  // Demo/Review: build a real briefing from the in-memory Wedding 2026 mock
  // signals via the pure buildBriefing engine. No DB: no workspace lookup, no
  // rotation read/write. The product reads exactly as it will in production —
  // only the data is synthetic.
  if (isDemoMode()) {
    const catalog: PlanningCatalog = {
      periods: [
        {
          id: "period_demo_school",
          name: "2026–27 School year",
          contextType: "school_year",
          startDate: "2026-09-01",
          endDate: "2027-06-30",
          timezone: "Europe/Dublin",
        },
      ],
      workspaces: [
        {
          id: "ws_demo_geography",
          name: "6th Year Geography",
          role: "owner",
          planningPeriodId: "period_demo_school",
          contextType: "class",
          primaryDate: "2027-06-09",
          primaryDateLabel: "State examinations",
        },
        {
          id: "ws_demo_history",
          name: "5th Year History",
          role: "owner",
          planningPeriodId: "period_demo_school",
          contextType: "class",
          primaryDate: "2027-06-09",
          primaryDateLabel: "State examinations",
        },
        {
          id: "ws_demo_politics",
          name: "Leaving Cert Politics",
          role: "owner",
          planningPeriodId: "period_demo_school",
          contextType: "class",
          primaryDate: "2027-06-09",
          primaryDateLabel: "State examinations",
        },
      ],
      planningSchemaAvailable: true,
    };
    const authorizedScope = authorizeSignalScope(
      catalog,
      opts.scope ?? {
        kind: "planningPeriod",
        planningPeriodId: "period_demo_school",
      },
      "Europe/Dublin",
    ) ?? authorizeSignalScope(
      catalog,
      { kind: "planningPeriod", planningPeriodId: "period_demo_school" },
      "Europe/Dublin",
    );
    if (!authorizedScope) return { kind: "no-workspace" };
    const demoSource: BriefingSource = planningPeriodsEnabled()
      ? {
          getSignalsForUser: async (context) => {
            const signals = await mockPlanningPeriodBriefingSource.getSignalsForUser(
              context,
            );
            return authorizedScope.scope.kind === "workspace"
              ? signals.filter((signal) =>
                  signal.sourceLabel?.endsWith(authorizedScope.label),
                )
              : signals;
          },
        }
      : mockBriefingSource;
    const briefing = await buildBriefing(
      demoSource,
      {
        userId: clerkId || "demo-user",
        email: "",
      },
    );
    const emptyCopy = getBriefingEmptyCopy({
      primaryUseCase: planningPeriodsEnabled() ? "student" : "venue",
    });
    return {
      kind: "ok",
      briefing: {
        ...briefing,
        emptyStateHeadline: emptyCopy.headline,
        emptyStateBody: emptyCopy.body,
      },
      authorizedScope,
      catalog,
    };
  }

  const rows = await db
    .select({
      workspaceId: analyticsUsers.linkedWorkspaceId,
      scopeKind: analyticsUsers.scopeKind,
      planningPeriodId: analyticsUsers.planningPeriodId,
      timezone: analyticsUsers.timezone,
    })
    .from(analyticsUsers)
    .where(eq(analyticsUsers.clerkId, clerkId))
    .limit(1);

  const prefs = rows[0];
  const persistedScope: SignalScope | null =
    prefs?.scopeKind === "planningPeriod" && prefs.planningPeriodId
      ? { kind: "planningPeriod", planningPeriodId: prefs.planningPeriodId }
      : prefs?.workspaceId
        ? { kind: "workspace", workspaceId: prefs.workspaceId }
        : null;
  const requestedScope = planningPeriodsEnabled()
    ? opts.scope ?? persistedScope
    : prefs?.workspaceId
      ? { kind: "workspace" as const, workspaceId: prefs.workspaceId }
      : null;
  if (!requestedScope) return { kind: "no-workspace" };

  const catalog = await listPlanningCatalogForUser({ clerkId, email: null });
  let authorizedScope = authorizeSignalScope(
    catalog,
    requestedScope,
    prefs?.timezone ?? "UTC",
  );
  if (!authorizedScope && opts.scope && persistedScope) {
    authorizedScope = authorizeSignalScope(
      catalog,
      persistedScope,
      prefs?.timezone ?? "UTC",
    );
  }
  if (!authorizedScope) return { kind: "no-workspace" };
  const workspaceIds = authorizedScope.workspaces.map((workspace) => workspace.id);
  const workspaceNames = new Map(
    authorizedScope.workspaces.map((workspace) => [workspace.id, workspace.name]),
  );
  const now = Date.now();

  const onboarding =
    (await dataSource.getWorkspaceOnboarding?.(workspaceIds[0]!)) ?? null;
  const emptyCopy = getBriefingEmptyCopy({
    primaryUseCase:
      authorizedScope.period?.contextType === "wedding"
        ? "wedding"
        : authorizedScope.period?.contextType === "school_year" ||
            authorizedScope.period?.contextType === "semester"
          ? "student"
          : onboarding?.primaryUseCase,
  });

  // Adapt the DataSource (workspace-keyed) into the BriefingSource
  // (user-context-keyed) interface that buildBriefing expects.
  // The rotation lookup and self-user id are wired via the day-rotation
  // helper inside buildBriefing; cadence is informational only at the
  // orchestrator level (the cron already filters by cadence before
  // calling buildBriefingForUser).
  const source: BriefingSource = {
    getSignalsForUser: async () => {
      const workspaces = dataSource.readMany
        ? await dataSource.readMany(workspaceIds)
        : await Promise.all(
            workspaceIds.map((workspaceId) => dataSource.read(workspaceId)),
          );
      // Flatten TaskReads into TaskSignals. The data/source layer
      // maps Tasks lanes → Analytics Status; we translate back to
      // the TaskSignal contract buildBriefing expects.
      return workspaces.flatMap((work) => work.tasks.map((t) => ({
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
        dueAt: t.dueDate ? dateOnlyToTimestamp(t.dueDate) : null,
        idleDays: (() => {
          const last = new Date(t.lastActivityAt).getTime();
          return Math.max(
            0,
            calendarDayDifference(now, last, authorizedScope.timezone),
          );
        })(),
        commentCount: 0,
        blockedBy: t.blockedBy,
        sourceLabel: `Tasks · ${workspaceNames.get(work.workspaceId) ?? "Workspace"}`,
        movedToShippedAt: t.status === "shipped"
          ? new Date(t.lastStatusChangeAt).getTime()
          : null,
        workspaceId: work.workspaceId,
        planningPeriodId: authorizedScope.period?.id ?? null,
      })));
    },
  };

  // Per-user read state: dismissals stick ("Not really" → the item
  // stays out under that trigger) and carry-overs age honestly
  // ("still waiting, day 3"). Both reads are fail-safe, a missing
  // table degrades to no suppression / no aging, never a failed brief.
  const [suppressed, ages] = await Promise.all([
    getDismissedKeys(clerkId),
    getSurfacedAges(clerkId, now),
  ]);

  const briefing = await buildBriefing(
    source,
    { userId: clerkId, email: "" },
    now,
    { suppressed, ages, timezone: authorizedScope.timezone },
  );

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

  // Extend/reset surfacing runs for the aging blocks (attention +
  // risks). Moving-well never ages, celebration doesn't carry over.
  await recordSurfaced(
    clerkId,
    [...briefing.needsAttention, ...briefing.quietRisks].map((item) => ({
      itemKey: item.id,
      triggerId: item.trigger,
    })),
    now,
  );

  return {
    kind: "ok",
    briefing: {
      ...briefing,
      emptyStateHeadline: emptyCopy.headline,
      emptyStateBody: emptyCopy.body,
    },
    authorizedScope,
    catalog,
  };
}
