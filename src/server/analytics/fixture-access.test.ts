import assert from "node:assert/strict";
import { test } from "node:test";
import { getAnalyticsFixture } from "@/lib/analytics/fixtures";
import type { ParsedAnalyticsQuery } from "./query";
import { authorizeFixtureQuery, FixtureAccessDeniedError } from "./fixture-access";

function parsed(scope: ParsedAnalyticsQuery["scope"], scenario: ParsedAnalyticsQuery["fixtureScenario"]): ParsedAnalyticsQuery {
  return {
    scope,
    period: "four_weeks",
    start: new Date("2026-06-15T09:00:00.000Z"),
    end: new Date("2026-07-13T09:00:00.000Z"),
    timezone: "Europe/London",
    customStart: null,
    customEnd: null,
    ownerIds: [],
    statuses: [],
    metric: "work_completed",
    breakdown: "project",
    page: 1,
    perPage: 25,
    fixtureScenario: scenario,
  };
}

test("unauthorized fixture scenario fails closed", () => {
  const fixture = getAnalyticsFixture("unauthorized");
  assert.throws(
    () => authorizeFixtureQuery(fixture, parsed(fixture.query.scope, "unauthorized")),
    FixtureAccessDeniedError,
  );
});

test("fixture My work normalizes me to the fixture owner identity", () => {
  const fixture = getAnalyticsFixture("signature");
  const result = authorizeFixtureQuery(
    fixture,
    parsed({ type: "user", id: "me", workspaceId: fixture.query.scope.workspaceId }, "signature"),
  );
  assert.equal(result.scope.id, fixture.access.userId);
});

test("fixture user scope rejects another identity", () => {
  const fixture = getAnalyticsFixture("signature");
  assert.throws(
    () => authorizeFixtureQuery(
      fixture,
      parsed({ type: "user", id: "someone-else", workspaceId: fixture.query.scope.workspaceId }, "signature"),
    ),
    FixtureAccessDeniedError,
  );
});
