import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import {
  ANALYTICS_FIXTURE_SCENARIOS,
  getAnalyticsFixture,
} from "./fixtures";
import { calculateMetrics } from "./metrics";

describe("non-production analytics fixtures", () => {
  test("covers every declared scenario without side effects", () => {
    for (const scenario of ANALYTICS_FIXTURE_SCENARIOS) {
      const fixture = getAnalyticsFixture(scenario);
      assert.equal(fixture.scenario, scenario);
      assert.ok(fixture.query.scope.workspaceId);
      assert.ok(fixture.snapshot.coverage.calculatedAt);
    }
  });

  test("signature fixture contains the required cross-product case", () => {
    const fixture = getAnalyticsFixture("signature");
    const metrics = calculateMetrics(fixture.snapshot, fixture.query);
    assert.equal(fixture.snapshot.projects.length, 3);
    assert.equal(metrics.open_decisions.value?.count, 2);
    assert.equal(metrics.blocked_work.value?.count, 4);
    assert.equal(metrics.open_overdue_work.value?.count, 5);
    assert.equal(metrics.unowned_work.value?.count, 1);
    assert.equal(metrics.milestone_movement.value?.changeCount, 2);
    assert.equal(metrics.cross_product_milestone_risk.value?.count, 1);
    assert.ok((metrics.work_completed.value?.count ?? 0) > 0);
    assert.equal(metrics.open_overdue_work.evidenceCount, 5);
    assert.deepEqual(metrics.open_overdue_work.sourceCounts, {
      notes: 0,
      tasks: 5,
      milestones: 0,
      projects: 0,
    });
  });

  test("models a member denied access to one project", () => {
    const fixture = getAnalyticsFixture("unauthorized");
    assert.equal(fixture.access.authorized, false);
    assert.deepEqual(fixture.access.allowedProjectIds, ["launch", "venue"]);
    assert.deepEqual(fixture.access.deniedProjectIds, ["private-client"]);
    assert.equal(fixture.query.scope.id, "private-client");
  });

  test("marks stale and provider-failure coverage explicitly", () => {
    assert.equal(getAnalyticsFixture("stale").snapshot.coverage.status, "stale");
    assert.equal(
      getAnalyticsFixture("provider_failure").snapshot.coverage.providers.tasks?.status,
      "unavailable",
    );
  });
});
