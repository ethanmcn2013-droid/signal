import assert from "node:assert/strict";
import { test } from "node:test";
import {
  currentLinkedWorkspaceIds,
  prioritizeSnapshotCandidates,
  scalarSnapshotAggregate,
  selectSnapshotBatch,
  snapshotRetentionCutoff,
  snapshotRunBlocksCapture,
  snapshotMetricNumber,
  stableSnapshotId,
} from "./snapshot-utils";

test("snapshot ids are stable and isolate workspace dimensions", () => {
  const first = stableSnapshotId("metric", "ws-a", "workspace", "open_work", "2026-07-13", "v1");
  assert.equal(first, stableSnapshotId("metric", "ws-a", "workspace", "open_work", "2026-07-13", "v1"));
  assert.notEqual(first, stableSnapshotId("metric", "ws-b", "workspace", "open_work", "2026-07-13", "v1"));
});

test("snapshot aggregate strips source content and identifier arrays", () => {
  assert.deepEqual(
    scalarSnapshotAggregate({ count: 3, medianDays: 4.5, title: "private", sourceIds: ["task-1"], missing: null }),
    { count: 3, medianDays: 4.5, missing: null },
  );
});

test("snapshot numeric values match metric units", () => {
  assert.equal(snapshotMetricNumber("open_work_age", { count: 9, medianDays: 6 }), 6);
  assert.equal(snapshotMetricNumber("milestone_movement", { changeCount: 2, netDays: 14 }), 2);
  assert.equal(snapshotMetricNumber("workload_distribution", { totalActive: 11, owners: [] }), 11);
});

test("snapshot continuation selects only eligible, existing, inactive workspaces", () => {
  const candidates = [
    { workspaceId: "ws-opted-in", timezone: "Europe/London" },
    { workspaceId: "ws-deleted", timezone: "UTC" },
    { workspaceId: "ws-active", timezone: "UTC" },
    { workspaceId: "ws-opted-in", timezone: "America/New_York" },
    { workspaceId: "ws-next", timezone: "UTC" },
  ];
  assert.deepEqual(
    selectSnapshotBatch(
      candidates,
      new Set(["ws-opted-in", "ws-active", "ws-next"]),
      new Set(["ws-active"]),
      2,
    ),
    [
      { workspaceId: "ws-opted-in", timezone: "Europe/London" },
      { workspaceId: "ws-next", timezone: "UTC" },
    ],
  );
});

test("snapshot continuation advances beyond the first page without duplicating work", () => {
  const candidates = Array.from({ length: 52 }, (_, index) => ({
    workspaceId: `ws-${String(index).padStart(2, "0")}`,
    timezone: "UTC",
  }));
  const existing = new Set(candidates.map((candidate) => candidate.workspaceId));
  const active = new Set<string>();
  const batches: string[][] = [];
  while (active.size < candidates.length) {
    const batch = selectSnapshotBatch(candidates, existing, active, 20);
    assert.ok(batch.length > 0);
    batches.push(batch.map((candidate) => candidate.workspaceId));
    for (const candidate of batch) active.add(candidate.workspaceId);
  }
  assert.deepEqual(batches.map((batch) => batch.length), [20, 20, 12]);
  assert.equal(new Set(batches.flat()).size, 52);
});

test("snapshot continuation prioritizes never-captured work across a UTC-day reset", () => {
  const candidates = Array.from({ length: 500 }, (_, index) => ({
    workspaceId: `ws-${String(index).padStart(3, "0")}`,
    timezone: "UTC",
  }));
  const existing = new Set(candidates.map((candidate) => candidate.workspaceId));
  const active = new Set<string>();
  const lastCompletedAt = new Map<string, number>();
  for (let invocation = 0; invocation < 22; invocation += 1) {
    const batch = selectSnapshotBatch(
      prioritizeSnapshotCandidates(candidates, lastCompletedAt),
      existing,
      active,
      20,
    );
    for (const candidate of batch) {
      active.add(candidate.workspaceId);
      lastCompletedAt.set(candidate.workspaceId, Date.parse("2026-07-13T12:00:00.000Z"));
    }
  }
  assert.equal(active.size, 440);

  const nextDay = selectSnapshotBatch(
    prioritizeSnapshotCandidates(candidates, lastCompletedAt),
    existing,
    new Set(),
    20,
  );
  assert.equal(nextDay[0]?.workspaceId, "ws-440");
  assert.equal(nextDay.at(-1)?.workspaceId, "ws-459");
});

test("snapshot eligibility requires a current linked Tasks owner or member", () => {
  const candidates = [
    { workspaceId: "ws-owned", timezone: "UTC", linkedClerkIds: ["clerk-owner"] },
    { workspaceId: "ws-member", timezone: "UTC", linkedClerkIds: ["clerk-member"] },
    { workspaceId: "ws-stale", timezone: "UTC", linkedClerkIds: ["clerk-stale"] },
  ];
  const allowed = currentLinkedWorkspaceIds(
    candidates,
    new Map([
      ["ws-owned", "tasks-owner"],
      ["ws-member", "someone-else"],
      ["ws-stale", "someone-else"],
    ]),
    new Map([
      ["clerk-owner", "tasks-owner"],
      ["clerk-member", "tasks-member"],
      ["clerk-stale", "tasks-stale"],
    ]),
    new Set(["ws-member\u001ftasks-member"]),
  );

  assert.deepEqual([...allowed].sort(), ["ws-member", "ws-owned"]);
});

test("snapshot locks expire and retention uses a global 400-day cutoff", () => {
  const now = new Date("2026-07-13T12:00:00.000Z");
  assert.equal(snapshotRunBlocksCapture("completed", new Date(0), now), true);
  assert.equal(
    snapshotRunBlocksCapture("running", new Date("2026-07-13T11:55:00.000Z"), now),
    true,
  );
  assert.equal(
    snapshotRunBlocksCapture("running", new Date("2026-07-13T11:40:00.000Z"), now),
    false,
  );
  assert.equal(snapshotRunBlocksCapture("failed", now, now), false);
  assert.equal(snapshotRetentionCutoff(now).toISOString(), "2025-06-08T12:00:00.000Z");
});
