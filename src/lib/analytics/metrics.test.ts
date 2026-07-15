import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import type { AnalyticsEvent, NoteRecord, TaskRecord } from "./contracts";
import { getAnalyticsFixture } from "./fixtures";
import { calculateMetrics } from "./metrics";
import { buildBriefing } from "./rules";
import { ScopeBoundaryError } from "./scope";

describe("deterministic analytics metrics", () => {
  test("counts terminal transitions in the selected period and falls back to completion timestamps", () => {
    const fixture = getAnalyticsFixture("signature");
    const metrics = calculateMetrics(fixture.snapshot, fixture.query);
    assert.equal(metrics.work_completed.value?.count, 4);
    assert.equal(metrics.open_work.value?.count, 8);
    assert.equal(
      metrics.work_completed.sources.every((source) => source.type === "task"),
      true,
    );

    const recompleted = calculateMetrics(
      {
        ...fixture.snapshot,
        events: [
          ...fixture.snapshot.events,
          {
            id: "older-terminal-transition",
            workspaceId: fixture.query.scope.workspaceId,
            projectIds: ["launch"],
            entityType: "task",
            entityId: "completed-1",
            kind: "status_changed",
            at: "2026-05-01T10:00:00.000Z",
            meaningful: true,
            terminalTransition: true,
            fromValue: "in-flight",
            toValue: "shipped",
          },
        ],
      },
      fixture.query,
    );
    assert.equal(
      recompleted.work_completed.value?.count,
      4,
      "a later transition in-period still counts when work was completed before",
    );

    const tasksCoverage = fixture.snapshot.coverage.providers.tasks!;
    const fallback = calculateMetrics(
      {
        ...fixture.snapshot,
        events: fixture.snapshot.events.filter((event) => event.entityType !== "task"),
        coverage: {
          ...fixture.snapshot.coverage,
          providers: {
            ...fixture.snapshot.coverage.providers,
            tasks: {
              ...tasksCoverage,
              capabilities: tasksCoverage.capabilities.filter(
                (capability) => capability !== "task_status_history",
              ),
            },
          },
        },
      },
      fixture.query,
    );
    assert.equal(fallback.work_completed.value?.count, 4);
    assert.equal(fallback.work_completed.status, "partial");
    assert.match(fallback.work_completed.sources[0].reason, /timestamp/);
  });

  test("counts only non-terminal work whose due semantics have expired", () => {
    const fixture = getAnalyticsFixture("signature");
    const metric = calculateMetrics(fixture.snapshot, fixture.query).open_overdue_work;
    assert.equal(metric.value?.count, 5);
    assert.equal(metric.sources.some((source) => source.id === "normal-1"), false);
    assert.equal(metric.sources.some((source) => source.id.startsWith("completed-")), false);
  });

  test("reports open-work age without treating missing due dates as missing creation dates", () => {
    const fixture = getAnalyticsFixture("signature");
    const metric = calculateMetrics(fixture.snapshot, fixture.query).open_work_age;
    assert.equal(metric.value?.count, 8);
    assert.ok((metric.value?.oldestDays ?? 0) >= 20);
    assert.ok((metric.value?.medianDays ?? 0) > 0);
  });

  test("stalled work ignores superficial events and uses meaningful progress only", () => {
    const fixture = getAnalyticsFixture("empty");
    const stalledTask: TaskRecord = {
      id: "stalled",
      workspaceId: fixture.query.scope.workspaceId,
      projectIds: ["launch"],
      title: "Waiting task",
      status: "in-flight",
      terminal: false,
      ownerIds: ["user-owner"],
      due: null,
      createdAt: "2026-06-01T09:00:00.000Z",
      completedAt: null,
      lastMeaningfulActivityAt: "2026-07-01T09:00:00.000Z",
      blocking: { explicit: false, dependencyIds: [], unresolvedDependencyIds: [] },
      linkedDecisionIds: [],
      linkedMilestoneIds: [],
      workType: "task",
      deepLink: "/tasks/stalled",
      updatedAt: "2026-07-13T08:00:00.000Z",
    };
    const superficial: AnalyticsEvent = {
      id: "superficial",
      workspaceId: fixture.query.scope.workspaceId,
      projectIds: ["launch"],
      entityType: "task",
      entityId: "stalled",
      kind: "updated",
      at: "2026-07-13T08:00:00.000Z",
      meaningful: false,
    };
    const metric = calculateMetrics(
      { ...fixture.snapshot, tasks: [stalledTask], events: [superficial] },
      fixture.query,
    ).stalled_work;
    assert.equal(metric.value?.count, 1);
    assert.equal(metric.value?.thresholdDays, 7);
  });

  test("keeps explicit and inferred blocking distinguishable without double counting", () => {
    const fixture = getAnalyticsFixture("signature");
    const metric = calculateMetrics(fixture.snapshot, fixture.query).blocked_work;
    assert.deepEqual(metric.value, {
      count: 4,
      explicitCount: 4,
      inferredCount: 4,
      bothCount: 4,
    });
  });

  test("counts active unowned work only", () => {
    const fixture = getAnalyticsFixture("signature");
    const metric = calculateMetrics(fixture.snapshot, fixture.query).unowned_work;
    assert.equal(metric.value?.count, 1);
    assert.equal(metric.sources[0]?.id, "unowned-1");
  });

  test("compares completion pace with the median of the prior three equal periods", () => {
    const fixture = getAnalyticsFixture("signature");
    const metric = calculateMetrics(fixture.snapshot, fixture.query).completion_pace_change;
    assert.equal(metric.status, "available");
    assert.deepEqual(metric.value, {
      currentCount: 4,
      priorCounts: [8, 7, 9],
      priorMedian: 8,
      delta: -4,
      percentChange: -50,
    });
    assert.match(metric.comparison?.basis ?? "", /median of three/);
  });

  test("suppresses pace claims when full comparison coverage is unavailable", () => {
    const fixture = getAnalyticsFixture("insufficient_history");
    const metric = calculateMetrics(fixture.snapshot, fixture.query).completion_pace_change;
    assert.equal(metric.status, "insufficient_history");
    assert.equal(metric.value, null);
    assert.match(metric.summary, /Not enough history yet/);
  });

  test("uses stored milestone history and calculates net movement", () => {
    const fixture = getAnalyticsFixture("signature");
    const metric = calculateMetrics(fixture.snapshot, fixture.query).milestone_movement;
    assert.deepEqual(metric.value, {
      changeCount: 2,
      milestoneCount: 1,
      netDays: 2,
    });
  });

  test("counts only structured open decisions and structured follow-ups", () => {
    const fixture = getAnalyticsFixture("signature");
    const template = fixture.snapshot.notes[0];
    const followUps: NoteRecord[] = [
      {
        ...template,
        id: "follow-open",
        kind: "follow_up",
        title: "Send recap",
        state: "open",
        completedAt: null,
      },
      {
        ...template,
        id: "follow-done",
        kind: "follow_up",
        title: "Confirm attendees",
        state: "completed",
        completedAt: "2026-07-10T12:00:00.000Z",
      },
    ];
    const metrics = calculateMetrics(
      { ...fixture.snapshot, notes: [...fixture.snapshot.notes, ...followUps] },
      fixture.query,
    );
    assert.equal(metrics.open_decisions.value?.count, 2);
    assert.deepEqual(metrics.follow_up_completion.value, {
      completedCount: 1,
      remainingCount: 1,
    });
  });

  test("describes workload as active distribution, not productivity", () => {
    const fixture = getAnalyticsFixture("signature");
    const metric = calculateMetrics(fixture.snapshot, fixture.query).workload_distribution;
    assert.equal(metric.value?.totalActive, 8);
    assert.equal(metric.value?.unownedCount, 1);
    assert.equal(metric.value?.owners[0].ownerId, "user-owner");
    assert.match(metric.summary, /not individual productivity/i);
  });

  test("grounds upcoming milestone risk in linked tasks, decisions and Timeline", () => {
    const fixture = getAnalyticsFixture("signature");
    const metric = calculateMetrics(
      fixture.snapshot,
      fixture.query,
    ).cross_product_milestone_risk;
    assert.equal(metric.value?.count, 1);
    assert.deepEqual(metric.value?.milestones[0].sourceTypes, [
      "timeline",
      "tasks",
      "notes",
    ]);
    assert.equal(metric.value?.milestones[0].blockedTaskIds.length, 4);
    assert.equal(metric.value?.milestones[0].openDecisionIds.length, 2);
  });

  test("includes a permitted unresolved Timeline dependency as evidence", () => {
    const fixture = getAnalyticsFixture("signature");
    const milestone = {
      ...fixture.snapshot.milestones[0],
      dependencyIds: ["timeline-blocker"],
      unresolvedDependencyIds: ["timeline-blocker"],
    };
    const metric = calculateMetrics(
      {
        ...fixture.snapshot,
        milestones: [milestone],
        timelineDependencies: [{
          id: "timeline-blocker",
          workspaceId: fixture.query.scope.workspaceId,
          projectId: "launch",
          title: "Client approval",
          state: "blocked",
          resolved: false,
          ownerIds: ["client-contact"],
          date: null,
          blockedMilestoneIds: [milestone.id],
          deepLink: "https://timeline.signalstudio.ie/fixture/launch/timeline-blocker",
          createdAt: "2026-07-01T09:00:00.000Z",
          updatedAt: "2026-07-12T09:00:00.000Z",
        }],
      },
      fixture.query,
    ).cross_product_milestone_risk;

    assert.ok(
      metric.sources.some(
        (source) =>
          source.id === "timeline-dependency:timeline-blocker" &&
          /unresolved timeline dependency/i.test(source.reason),
      ),
    );
  });

  test("does not convert a missing Timeline dependency row into asserted risk", () => {
    const fixture = getAnalyticsFixture("healthy");
    const milestone = {
      ...fixture.snapshot.milestones[0],
      currentDate: { kind: "date" as const, value: "2026-07-17" },
      dependencyIds: ["missing-blocker"],
      unresolvedDependencyIds: ["missing-blocker"],
    };
    const partialTimeline = {
      ...fixture.snapshot.coverage.providers.timeline!,
      status: "partial" as const,
      issues: ["timeline_dependency_record_unavailable"],
    };
    const snapshot = {
      ...fixture.snapshot,
      milestones: [milestone],
      timelineDependencies: [],
      coverage: {
        ...fixture.snapshot.coverage,
        status: "partial" as const,
        providers: {
          ...fixture.snapshot.coverage.providers,
          timeline: partialTimeline,
        },
      },
    };
    const metrics = calculateMetrics(snapshot, fixture.query);
    const briefing = buildBriefing(snapshot, fixture.query);

    assert.equal(metrics.cross_product_milestone_risk.status, "partial");
    assert.equal(metrics.cross_product_milestone_risk.value?.count, 0);
    assert.equal(
      briefing.observations.some((item) => item.type === "cross_product_milestone_risk"),
      false,
    );
  });

  test("does not report a numerical follow-up completion zero when timing is unknown", () => {
    const fixture = getAnalyticsFixture("signature");
    const completedFollowUp = {
      ...fixture.snapshot.notes[0],
      id: "follow-up-without-transition",
      kind: "follow_up" as const,
      state: "completed" as const,
      completedAt: null,
    };
    const metric = calculateMetrics(
      { ...fixture.snapshot, notes: [completedFollowUp] },
      fixture.query,
    ).follow_up_completion;

    assert.equal(metric.status, "partial");
    assert.equal(metric.value, null);
    assert.match(metric.summary, /verified completion time/i);
    assert.equal(metric.sources[0]?.id, completedFollowUp.id);
  });

  test("degrades provider failures to unsupported metrics without inventing zero", () => {
    const fixture = getAnalyticsFixture("provider_failure");
    const metrics = calculateMetrics(fixture.snapshot, fixture.query);
    assert.equal(metrics.open_work.status, "unsupported");
    assert.equal(metrics.open_work.value, null);
    assert.equal(metrics.work_completed.value, null);
  });

  test("applies project filters defensively and rejects workspace boundary drift", () => {
    const fixture = getAnalyticsFixture("signature");
    const projectQuery: typeof fixture.query = {
      ...fixture.query,
      scope: {
        type: "project",
        id: "venue",
        workspaceId: fixture.query.scope.workspaceId,
      },
    };
    const metrics = calculateMetrics(fixture.snapshot, projectQuery);
    assert.equal(metrics.open_work.value?.count, 2);
    assert.equal(metrics.unowned_work.value?.count, 1);

    assert.throws(
      () =>
        calculateMetrics(fixture.snapshot, {
          ...fixture.query,
          scope: {
            type: "workspace",
            id: "another-workspace",
            workspaceId: "another-workspace",
          },
        }),
      ScopeBoundaryError,
    );
  });
});
