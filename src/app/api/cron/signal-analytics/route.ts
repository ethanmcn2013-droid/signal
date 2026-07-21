import "server-only";

import { timingSafeEqual } from "node:crypto";
import { inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { PRIVATE_RESPONSE_HEADERS } from "@/server/analytics/errors";
import { isSignalAnalyticsEnabled } from "@/server/analytics/feature-flag";
import {
  activeSnapshotWorkspaceIds,
  captureWorkspaceSnapshots,
  lastCompletedSnapshotWorkspaceTimes,
  listEligibleSnapshotWorkspaces,
  pruneExpiredAnalyticsHistory,
} from "@/server/analytics/snapshots";
import {
  currentLinkedWorkspaceIds,
  prioritizeSnapshotCandidates,
  selectSnapshotBatch,
} from "@/server/analytics/snapshot-utils";
import { getTasksDb } from "@/server/tasks-db/client";
import { users, workspaceMembers, workspaces } from "@/server/tasks-db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  return run(request);
}

export async function POST(request: Request) {
  return run(request);
}

async function run(request: Request) {
  const started = performance.now();
  if (!validCronSecret(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: PRIVATE_RESPONSE_HEADERS });
  }
  const now = new Date();
  const retentionCutoff = await pruneExpiredAnalyticsHistory(now);
  if (!isSignalAnalyticsEnabled()) {
    return NextResponse.json(
      { ok: true, status: "disabled", retentionCutoff: retentionCutoff.toISOString() },
      { headers: PRIVATE_RESPONSE_HEADERS },
    );
  }
  const db = getTasksDb();
  if (!db) {
    return NextResponse.json({ error: "tasks_provider_unavailable" }, { status: 503, headers: PRIVATE_RESPONSE_HEADERS });
  }
  const url = new URL(request.url);
  const configuredBatchSize = boundedInteger(
    process.env.SIGNAL_ANALYTICS_SNAPSHOT_BATCH_SIZE ?? null,
    20,
    1,
    25,
  );
  const batchSize = boundedInteger(
    url.searchParams.get("batch_size"),
    configuredBatchSize,
    1,
    25,
  );
  const eligible = await listEligibleSnapshotWorkspaces();
  const [active, lastCompletedAt] = await Promise.all([
    activeSnapshotWorkspaceIds(now),
    lastCompletedSnapshotWorkspaceTimes(),
  ]);
  const currentMembers = await currentMemberWorkspaceIds(
    db,
    eligible,
  );
  const prioritized = prioritizeSnapshotCandidates(eligible, lastCompletedAt);
  const pending = prioritized.filter(
    (workspace) => currentMembers.has(workspace.workspaceId) && !active.has(workspace.workspaceId),
  );
  const selected = selectSnapshotBatch(prioritized, currentMembers, active, batchSize);

  const results = [];
  for (const workspace of selected) {
    if (performance.now() - started > 50_000) break;
    try {
      results.push({
        workspaceId: workspace.workspaceId,
        ...(await captureWorkspaceSnapshots({
          workspaceId: workspace.workspaceId,
          timezone: workspace.timezone,
          now,
        })),
      });
    } catch (error) {
      results.push({
        workspaceId: workspace.workspaceId,
        status: "failed" as const,
        errorCode: error instanceof Error ? error.name : "UnknownError",
      });
    }
  }
  // A concurrent invocation may win a daily receipt between selection and
  // capture. Treat that safe `skipped` result as processed for continuation
  // accounting so the schedule does not report phantom remaining work.
  const processed = results.filter((result) => result.status !== "failed").length;
  const remaining = Math.max(0, pending.length - processed);
  return NextResponse.json(
    {
      ok: results.every((result) => result.status !== "failed"),
      eligibility: "linked_signal_workspace",
      eligible: eligible.length,
      ineligibleOrUnavailable: eligible.length - currentMembers.size,
      batchSize,
      remaining,
      continuationScheduled: remaining > 0,
      retentionCutoff: retentionCutoff.toISOString(),
      results,
    },
    {
      headers: {
        ...PRIVATE_RESPONSE_HEADERS,
        "Server-Timing": `snapshots;dur=${(performance.now() - started).toFixed(1)}`,
      },
    },
  );
}

async function currentMemberWorkspaceIds(
  db: NonNullable<ReturnType<typeof getTasksDb>>,
  candidates: Awaited<ReturnType<typeof listEligibleSnapshotWorkspaces>>,
): Promise<Set<string>> {
  const workspaceIds = candidates.map((candidate) => candidate.workspaceId);
  const clerkIds = [...new Set(candidates.flatMap((candidate) => candidate.linkedClerkIds ?? []))];
  const workspaceOwners = new Map<string, string | null>();
  for (let index = 0; index < workspaceIds.length; index += 200) {
    const chunk = workspaceIds.slice(index, index + 200);
    if (!chunk.length) continue;
    const rows = await db
      .select({ workspaceId: workspaces.id, ownerUserId: workspaces.ownerUserId })
      .from(workspaces)
      .where(inArray(workspaces.id, chunk));
    for (const row of rows) workspaceOwners.set(row.workspaceId, row.ownerUserId);
  }

  const tasksUserByClerk = new Map<string, string>();
  for (let index = 0; index < clerkIds.length; index += 200) {
    const chunk = clerkIds.slice(index, index + 200);
    if (!chunk.length) continue;
    const rows = await db
      .select({ id: users.id, clerkId: users.clerkId })
      .from(users)
      .where(inArray(users.clerkId, chunk));
    for (const row of rows) if (row.clerkId) tasksUserByClerk.set(row.clerkId, row.id);
  }

  const membershipPairs = new Set<string>();
  const taskUserIds = [...new Set(tasksUserByClerk.values())];
  for (let index = 0; index < taskUserIds.length; index += 200) {
    const chunk = taskUserIds.slice(index, index + 200);
    if (!chunk.length) continue;
    const rows = await db
      .select({ workspaceId: workspaceMembers.workspaceId, userId: workspaceMembers.userId })
      .from(workspaceMembers)
      .where(inArray(workspaceMembers.userId, chunk));
    for (const row of rows) membershipPairs.add(`${row.workspaceId}\u001f${row.userId}`);
  }

  return currentLinkedWorkspaceIds(
    candidates,
    workspaceOwners,
    tasksUserByClerk,
    membershipPairs,
  );
}

function validCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const actual = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  return actual.length === expected.length && timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

function boundedInteger(value: string | null, fallback: number, min: number, max: number): number {
  if (!value || !/^\d+$/.test(value)) return fallback;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}
