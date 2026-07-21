import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import {
  parseAnalyticsUrlState,
  serializeAnalyticsUrlState,
  withEvidence,
  withSignalView,
} from "./url-state";

const DEFAULTS = {
  workspaceId: "ws-1",
  timezone: "Europe/London",
  now: "2026-07-13T09:00:00.000Z",
} as const;

describe("shareable Signal URL state", () => {
  test("parses scope, filters, view, trend and evidence without losing context", () => {
    const params = new URLSearchParams({
      view: "trends",
      scope_type: "project",
      scope_id: "launch",
      workspace_id: "ws-1",
      period: "twelve_weeks",
      timezone: "Europe/London",
      metric: "blocked_work",
      breakdown: "owner",
      evidence: "observation-1",
      page: "2",
      per_page: "50",
    });
    params.append("owner", "u-1");
    params.append("owner", "u-2");
    params.append("status", "blocked");
    const state = parseAnalyticsUrlState(params, DEFAULTS);
    assert.equal(state.view, "trends");
    assert.deepEqual(state.query.scope, {
      type: "project",
      id: "launch",
      workspaceId: "ws-1",
    });
    assert.deepEqual(state.query.filters, {
      ownerIds: ["u-1", "u-2"],
      statuses: ["blocked"],
    });
    assert.equal(state.query.metric, "blocked_work");
    assert.equal(state.query.breakdown, "owner");
    assert.equal(state.evidenceId, "observation-1");
    assert.equal(state.evidencePage, 1);
    assert.deepEqual(state.query.pagination, { page: 2, perPage: 50 });
  });

  test("round-trips state and preserves evidence across view changes", () => {
    const initial = parseAnalyticsUrlState(new URLSearchParams(), DEFAULTS);
    const withDrawer = withEvidence(initial, "evidence-9");
    const trends = withSignalView(withDrawer, "trends");
    const serialized = serializeAnalyticsUrlState(trends);
    assert.equal(serialized.get("period"), "four_weeks");
    assert.equal(serialized.has("start"), false);
    assert.equal(serialized.has("end"), false);
    const reparsed = parseAnalyticsUrlState(
      serialized,
      DEFAULTS,
    );
    assert.equal(reparsed.view, "trends");
    assert.equal(reparsed.evidenceId, "evidence-9");
    assert.equal(reparsed.evidencePage, 1);
    assert.deepEqual(reparsed.query.scope, initial.query.scope);
    assert.deepEqual(reparsed.query.period, initial.query.period);
  });

  test("bounds pagination and rejects malformed or overlong custom ranges", () => {
    const malformed = parseAnalyticsUrlState(
      new URLSearchParams({
        start: "2020-01-01T00:00:00.000Z",
        end: "2026-07-13T09:00:00.000Z",
        page: "-1",
        per_page: "1000",
        metric: "made_up",
        scope_type: "tenant",
      }),
      DEFAULTS,
    );
    assert.equal(malformed.query.period.preset, "four_weeks");
    assert.deepEqual(malformed.query.pagination, { page: 1, perPage: 25 });
    assert.equal(malformed.query.metric, "work_completed");
    assert.equal(malformed.query.scope.type, "workspace");

    const evidencePage = parseAnalyticsUrlState(
      new URLSearchParams({ evidence: "observation-1", evidence_page: "5" }),
      DEFAULTS,
    );
    assert.equal(evidencePage.evidencePage, 5);
    const excessiveEvidencePage = parseAnalyticsUrlState(
      new URLSearchParams({ evidence: "observation-1", evidence_page: "10001" }),
      DEFAULTS,
    );
    assert.equal(excessiveEvidencePage.evidencePage, 1);
  });

  test("deduplicates and bounds repeated owner/status filters", () => {
    const params = new URLSearchParams();
    for (let index = 0; index < 30; index += 1) {
      params.append("owner", index < 2 ? "same" : `owner-${index}`);
    }
    params.set("status", "blocked,blocked,in-flight");
    const state = parseAnalyticsUrlState(params, DEFAULTS);
    assert.equal(state.query.filters?.ownerIds?.length, 20);
    assert.deepEqual(state.query.filters?.statuses, ["blocked", "in-flight"]);
  });

  test("ignores stale custom boundaries after selecting a preset", () => {
    const state = parseAnalyticsUrlState(
      new URLSearchParams({
        period: "four_weeks",
        start: "2025-01-01",
        end: "2025-01-02",
      }),
      {
        workspaceId: "ws-1",
        now: "2026-07-13T09:00:00.000Z",
        timezone: "Europe/London",
      },
    );

    assert.equal(state.query.period.preset, "four_weeks");
    assert.notEqual(state.query.period.start.slice(0, 10), "2025-01-01");
  });
});
