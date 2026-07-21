import assert from "node:assert/strict";
import test from "node:test";
import {
  attentionProjectsEvidenceObservation,
  milestoneEvidenceObservation,
  projectEvidenceObservation,
  projectsNeedingAttentionCount,
} from "./evidence";
import { getAnalyticsFixture } from "./fixtures";

test("project evidence contains the records that produced its state", () => {
  const fixture = getAnalyticsFixture("signature");
  const observation = projectEvidenceObservation(fixture.snapshot, fixture.query, "launch");

  assert.equal(observation?.state, "needs_attention");
  assert.match(observation?.reasons.join(" ") ?? "", /5 overdue/i);
  assert.ok(observation?.sources.some((source) => source.id === "overdue-5"));
  assert.equal(
    observation?.sources.some((source) => source.id.startsWith("completed-")),
    false,
  );
});

test("projects-needing-attention summary resolves to project-state reasons", () => {
  const fixture = getAnalyticsFixture("signature");
  const observation = attentionProjectsEvidenceObservation(fixture.snapshot, fixture.query);

  assert.equal(observation?.id, "summary:projects_needing_attention");
  assert.match(observation?.title ?? "", /project needs attention/i);
  assert.match(observation?.reasons[0] ?? "", /^Launch:/);
  assert.ok((observation?.evidenceCount ?? 0) > 0);
});

test("milestone evidence distinguishes resolved and unresolved Timeline dependencies", () => {
  const fixture = getAnalyticsFixture("signature");
  const milestone = {
    ...fixture.snapshot.milestones[0],
    dependencyIds: ["resolved-dependency", "open-dependency"],
    unresolvedDependencyIds: ["open-dependency"],
  };
  const dependency = (id: string, resolved: boolean) => ({
    id,
    workspaceId: fixture.query.scope.workspaceId,
    projectId: "launch",
    title: id,
    state: resolved ? "shipped" : "blocked",
    resolved,
    ownerIds: ["user-owner"],
    date: null,
    blockedMilestoneIds: [milestone.id],
    deepLink: `https://timeline.signalstudio.ie/fixture/launch/${id}`,
    createdAt: "2026-07-01T09:00:00.000Z",
    updatedAt: "2026-07-12T09:00:00.000Z",
  });
  const observation = milestoneEvidenceObservation(
    {
      ...fixture.snapshot,
      milestones: [milestone],
      timelineDependencies: [
        dependency("resolved-dependency", true),
        dependency("open-dependency", false),
      ],
    },
    fixture.query,
    milestone.id,
  );

  assert.match(observation?.reasons.join(" ") ?? "", /1 dependency is unresolved/i);
  assert.ok(observation?.sources.some((source) => /Resolved Timeline dependency/.test(source.reason)));
  assert.ok(observation?.sources.some((source) => /Unresolved Timeline dependency/.test(source.reason)));
});

test("project evidence retains more than 100 authorized records for server pagination", () => {
  const fixture = getAnalyticsFixture("signature");
  const template = fixture.snapshot.tasks.find((task) => task.id === "overdue-5")!;
  const tasks = Array.from({ length: 150 }, (_, index) => ({
    ...template,
    id: `bulk-${index + 1}`,
    title: `Bulk task ${index + 1}`,
    deepLink: `https://tasks.signalstudio.ie/app?task=bulk-${index + 1}`,
  }));
  const observation = projectEvidenceObservation(
    { ...fixture.snapshot, tasks, notes: [], milestones: [] },
    fixture.query,
    "launch",
  );

  assert.equal(observation?.evidenceCount, 150);
  assert.equal(observation?.sources.length, 150);
  assert.equal(observation?.sources[124]?.id, "bulk-125");
});

test("attention count is independent of the 100-row Overview table limit", () => {
  const fixture = getAnalyticsFixture("signature");
  const templateProject = fixture.snapshot.projects[0];
  const templateTask = fixture.snapshot.tasks.find((task) => task.id === "overdue-5")!;
  const projects = Array.from({ length: 120 }, (_, index) => ({
    ...templateProject,
    id: `project-${index + 1}`,
    name: `Project ${index + 1}`,
  }));
  const tasks = projects.map((project, index) => ({
    ...templateTask,
    id: `overdue-project-${index + 1}`,
    projectIds: [project.id],
  }));

  assert.equal(
    projectsNeedingAttentionCount(
      { ...fixture.snapshot, projects, tasks, notes: [], milestones: [] },
      fixture.query,
    ),
    120,
  );
});
