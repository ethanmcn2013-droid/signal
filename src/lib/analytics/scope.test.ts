import assert from "node:assert/strict";
import test from "node:test";
import { getAnalyticsFixture } from "./fixtures";
import { scopeSnapshot } from "./scope";

test("status filters consistently constrain linked records, projects, and events", () => {
  const fixture = getAnalyticsFixture("signature");
  const filtered = scopeSnapshot(fixture.snapshot, {
    ...fixture.query,
    filters: { statuses: ["in-flight"] },
  });

  assert.ok(filtered.tasks.length > 0);
  assert.ok(filtered.tasks.every((task) => task.status === "in-flight"));
  assert.equal(filtered.milestones.length, 0, "blocked-linked milestone must not survive an in-flight filter");
  assert.equal(filtered.notes.length, 0, "decisions linked only to blocked tasks must not survive");
  assert.ok(filtered.events.every((event) => event.entityType === "task"));
  assert.deepEqual(
    filtered.projects.map((project) => project.id).sort(),
    ["launch", "private-client", "venue"],
  );
});

test("owner filters remove unrelated project rows and contributing events", () => {
  const fixture = getAnalyticsFixture("signature");
  const filtered = scopeSnapshot(fixture.snapshot, {
    ...fixture.query,
    filters: { ownerIds: ["nobody"] },
  });

  assert.deepEqual(filtered.tasks, []);
  assert.deepEqual(filtered.notes, []);
  assert.deepEqual(filtered.milestones, []);
  assert.deepEqual(filtered.projects, []);
  assert.deepEqual(filtered.events, []);
});
