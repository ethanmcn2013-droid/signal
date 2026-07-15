import assert from "node:assert/strict";
import test from "node:test";
import type { TimelineDependencyRecord } from "./contracts";
import {
  timelineDependencyResolved,
  unresolvedTimelineDependencyIds,
} from "./timeline-dependencies";

function dependency(id: string, resolved: boolean): TimelineDependencyRecord {
  return {
    id,
    workspaceId: "workspace-1",
    projectId: "project-1",
    title: id,
    state: resolved ? "shipped" : "blocked",
    resolved,
    ownerIds: [],
    date: null,
    blockedMilestoneIds: ["milestone-1"],
    deepLink: `/timeline/project-1/${id}`,
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-10T00:00:00.000Z",
  };
}

test("Timeline dependency terminal state or completion timestamp resolves blocking", () => {
  assert.equal(timelineDependencyResolved("shipped", null), true);
  assert.equal(timelineDependencyResolved("blocked", "2026-07-10T00:00:00.000Z"), true);
  assert.equal(timelineDependencyResolved("blocked", null), false);
});

test("missing dependency records fail closed as unresolved", () => {
  assert.deepEqual(
    unresolvedTimelineDependencyIds(
      ["resolved", "open", "not-permitted", "open"],
      [dependency("resolved", true), dependency("open", false)],
    ),
    ["open", "not-permitted"],
  );
});
