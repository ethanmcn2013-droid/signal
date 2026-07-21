import assert from "node:assert/strict";
import { test } from "node:test";
import type { ParsedAnalyticsQuery } from "./query";
import { normalizeAnalyticsQueryTimezone } from "./timezone";

function query(overrides: Partial<ParsedAnalyticsQuery> = {}): ParsedAnalyticsQuery {
  return {
    scope: { type: "workspace", id: "ws-1", workspaceId: "ws-1" },
    period: "four_weeks",
    start: new Date("2026-03-18T09:00:00.000Z"),
    end: new Date("2026-04-15T09:00:00.000Z"),
    timezone: "UTC",
    customStart: null,
    customEnd: null,
    ownerIds: [],
    statuses: [],
    metric: "work_completed",
    breakdown: "project",
    page: 1,
    perPage: 25,
    fixtureScenario: null,
    ...overrides,
  };
}

test("preset periods preserve local wall-clock time across a DST boundary", () => {
  const result = normalizeAnalyticsQueryTimezone(query(), "Europe/London");
  assert.equal(result.timezone, "Europe/London");
  assert.equal(result.end.toISOString(), "2026-04-15T09:00:00.000Z");
  assert.equal(
    (result.end.getTime() - result.start.getTime()) / 3_600_000,
    671,
    "28 local days crossing spring DST is 671 elapsed hours",
  );
});

test("date-only custom range includes the 25-hour DST fallback day", () => {
  const result = normalizeAnalyticsQueryTimezone(
    query({
      period: "custom",
      customStart: "2026-10-25",
      customEnd: "2026-10-25",
      start: new Date("2026-10-25T00:00:00.000Z"),
      end: new Date("2026-10-26T00:00:00.000Z"),
    }),
    "Europe/London",
  );
  assert.equal((result.end.getTime() - result.start.getTime()) / 3_600_000, 25);
});
