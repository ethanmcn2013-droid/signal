import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { getAnalyticsFixture } from "./fixtures";
import { calculateMetrics } from "./metrics";
import {
  SIGNAL_RULE_VERSION,
  buildBriefing,
  buildRuleCandidates,
  rankAndSelectObservations,
  type RuleCandidate,
} from "./rules";

describe("versioned observation rules", () => {
  test("selects at most three grounded observations with useful actions", () => {
    const fixture = getAnalyticsFixture("signature");
    const briefing = buildBriefing(fixture.snapshot, fixture.query);
    assert.ok(briefing.observations.length > 0);
    assert.ok(briefing.observations.length <= 3);
    for (const observation of briefing.observations) {
      const evidenceCount =
        observation.sourceCounts.tasks +
        observation.sourceCounts.notes +
        observation.sourceCounts.milestones;
      assert.ok(evidenceCount > 0);
      assert.equal(observation.evidenceCount, evidenceCount);
      assert.ok(observation.actions.some((action) => action.primary));
      assert.equal(observation.ruleVersion, SIGNAL_RULE_VERSION);
    }
  });

  test("prioritizes and combines the signature cross-product issue", () => {
    const fixture = getAnalyticsFixture("signature");
    const briefing = buildBriefing(fixture.snapshot, fixture.query);
    const lead = briefing.observations[0];
    assert.equal(lead.type, "cross_product_milestone_risk");
    assert.match(lead.title, /2 unresolved decisions/);
    assert.equal(lead.sourceCounts.tasks, 5);
    assert.equal(lead.sourceCounts.notes, 2);
    assert.equal(lead.sourceCounts.milestones, 1);
    assert.equal(lead.evidenceCount, 8);
    assert.equal(
      briefing.observations.filter((item) => item.type === "blocked_work").length,
      0,
      "overlapping blocked-work candidate should be folded into the lead issue",
    );
  });

  test("returns the exact successful empty state without manufacturing concern", () => {
    const fixture = getAnalyticsFixture("healthy");
    const briefing = buildBriefing(fixture.snapshot, fixture.query);
    assert.deepEqual(briefing.observations, []);
    assert.deepEqual(briefing.emptyState, {
      headline: "Nothing needs you right now.",
      body: "Work is moving normally.",
    });
  });

  test("never renders the healthy all-clear when a provider failed", () => {
    const fixture = getAnalyticsFixture("provider_failure");
    const briefing = buildBriefing(fixture.snapshot, fixture.query);
    assert.deepEqual(briefing.observations, []);
    assert.equal(briefing.meta.freshness, "partial");
    assert.deepEqual(briefing.emptyState, {
      headline: "Signal has an incomplete view right now.",
      body: "Some connected sources could not be checked, so Signal cannot confirm that work is moving normally.",
    });
  });

  test("labels an otherwise quiet stale briefing honestly", () => {
    const fixture = getAnalyticsFixture("stale");
    const briefing = buildBriefing(fixture.snapshot, fixture.query);
    assert.deepEqual(briefing.observations, []);
    assert.equal(briefing.meta.freshness, "stale");
    assert.match(briefing.emptyState?.headline ?? "", /out of date/i);
    assert.notEqual(briefing.emptyState?.headline, "Nothing needs you right now.");
  });

  test("does not produce a slower-work claim with insufficient history", () => {
    const fixture = getAnalyticsFixture("insufficient_history");
    const metrics = calculateMetrics(fixture.snapshot, fixture.query);
    const candidates = buildRuleCandidates(
      fixture.snapshot,
      fixture.query,
      metrics,
    );
    assert.equal(
      candidates.some((candidate) => candidate.type === "completion_pace_change"),
      false,
    );
  });

  test("observation identifiers are stable for identical evidence", () => {
    const fixture = getAnalyticsFixture("signature");
    const first = buildBriefing(fixture.snapshot, fixture.query);
    const second = buildBriefing(fixture.snapshot, fixture.query);
    assert.deepEqual(
      first.observations.map((item) => item.id),
      second.observations.map((item) => item.id),
    );
  });

  test("suppresses repeated low-value issues but lets higher-impact changes through", () => {
    const fixture = getAnalyticsFixture("signature");
    const candidates = buildRuleCandidates(
      fixture.snapshot,
      fixture.query,
      calculateMetrics(fixture.snapshot, fixture.query),
    );
    const unowned = candidates.find((candidate) => candidate.issueKey === "tasks:unowned");
    assert.ok(unowned);
    const suppression = {
      issueKey: "tasks:unowned",
      until: "2026-07-20T09:00:00.000Z",
      reason: "repeated_low_value" as const,
    };
    const lowValue = rankAndSelectObservations([unowned!], fixture.snapshot.capturedAt, {
      suppressions: [suppression],
    });
    assert.equal(lowValue.length, 0);

    const higherImpact: RuleCandidate = {
      ...unowned!,
      ranking: { ...unowned!.ranking, impact: 3 },
    };
    const selected = rankAndSelectObservations(
      [higherImpact],
      fixture.snapshot.capturedAt,
      { suppressions: [suppression] },
    );
    assert.equal(selected.length, 1);
  });

  test("removes candidates with inadequate evidence or no primary action", () => {
    const fixture = getAnalyticsFixture("signature");
    const candidate = buildRuleCandidates(
      fixture.snapshot,
      fixture.query,
      calculateMetrics(fixture.snapshot, fixture.query),
    )[0];
    const noEvidence: RuleCandidate = {
      ...candidate,
      sources: [],
      evidenceCount: 0,
      sourceCounts: { notes: 0, tasks: 0, milestones: 0 },
    };
    const noAction: RuleCandidate = {
      ...candidate,
      id: `${candidate.id}-no-action`,
      issueKey: `${candidate.issueKey}:no-action`,
      actions: candidate.actions.map((action) => ({ ...action, primary: false })),
    };
    assert.deepEqual(
      rankAndSelectObservations(
        [noEvidence, noAction],
        fixture.snapshot.capturedAt,
      ),
      [],
    );
  });

  test("configuration cannot raise the briefing cap above three", () => {
    const fixture = getAnalyticsFixture("signature");
    const candidates = buildRuleCandidates(
      fixture.snapshot,
      fixture.query,
      calculateMetrics(fixture.snapshot, fixture.query),
    );
    const expanded = Array.from({ length: 8 }, (_, index) => ({
      ...candidates[index % candidates.length],
      id: `distinct-${index}`,
      issueKey: `distinct-${index}`,
      sources: candidates[index % candidates.length].sources.map((source) => ({
        ...source,
        id: `${source.id}-${index}`,
      })),
    }));
    const selected = rankAndSelectObservations(
      expanded,
      fixture.snapshot.capturedAt,
      { configuration: { maxObservations: 99 } },
    );
    assert.equal(selected.length, 3);
  });

  test("keeps total evidence accurate when inline sources are capped", () => {
    const empty = getAnalyticsFixture("empty");
    const template = getAnalyticsFixture("signature").snapshot.tasks.find(
      (task) => task.id === "unowned-1",
    )!;
    const tasks = Array.from({ length: 150 }, (_, index) => ({
      ...template,
      id: `unowned-${index}`,
      title: `Unowned work ${index}`,
      projectIds: ["launch"],
      deepLink: `/tasks/unowned-${index}`,
      due: null,
      createdAt: "2026-07-12T09:00:00.000Z",
      lastMeaningfulActivityAt: "2026-07-13T08:00:00.000Z",
    }));
    const briefing = buildBriefing(
      { ...empty.snapshot, tasks },
      empty.query,
    );
    const observation = briefing.observations[0];
    assert.equal(observation.type, "unowned_work");
    assert.equal(observation.evidenceCount, 150);
    assert.equal(observation.sourceCounts.tasks, 150);
    assert.equal(observation.sources.length, 100);
  });

  test("trend actions use the Trends route and preserve scope, period, and filters", () => {
    const fixture = getAnalyticsFixture("signature");
    const briefing = buildBriefing(fixture.snapshot, {
      ...fixture.query,
      filters: { ownerIds: ["user-owner"], statuses: ["blocked"] },
    });
    const trendAction = briefing.observations
      .flatMap((observation) => observation.actions)
      .find((action) => action.href.startsWith("/app/trends?"));
    assert.ok(trendAction);
    const url = new URL(trendAction.href, "https://signal.signalstudio.ie");
    assert.equal(url.pathname, "/app/trends");
    assert.equal(url.searchParams.get("scope_type"), "workspace");
    assert.equal(url.searchParams.get("scope_id"), "ws-signal-fixture");
    assert.equal(url.searchParams.get("period"), "four_weeks");
    assert.deepEqual(url.searchParams.getAll("owner"), ["user-owner"]);
    assert.deepEqual(url.searchParams.getAll("status"), ["blocked"]);
  });
});
