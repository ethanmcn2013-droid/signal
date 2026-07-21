import assert from "node:assert/strict";
import { test } from "node:test";
import type { AnalyticsQuery } from "./contracts";
import { getAnalyticsFixture } from "./fixtures";
import { calculateMetric } from "./metrics";
import { resolvePeriod } from "./time";
import { buildTrendPoints, resolveTrendStatus } from "./trend-series";

function twelveWeekQuery(): AnalyticsQuery {
  const fixture = getAnalyticsFixture("signature");
  return {
    ...fixture.query,
    period: resolvePeriod(
      "twelve_weeks",
      fixture.snapshot.capturedAt,
      fixture.query.period.timezone,
    ),
  };
}

test("does not zero-fill time before a provider's trustworthy history window", () => {
  const fixture = getAnalyticsFixture("insufficient_history");
  const query = twelveWeekQuery();
  const points = buildTrendPoints(fixture.snapshot, query, "work_completed");

  assert.equal(points.length, 1);
  assert.equal(
    resolveTrendStatus(
      calculateMetric(fixture.snapshot, query, "work_completed").status,
      "work_completed",
      points.length,
    ),
    "insufficient_history",
  );
  assert.ok(points.every((point) => point.start >= "2026-07-06T09:00:00.000Z"));
});

test("preserves provider unavailability instead of reporting insufficient history", () => {
  const fixture = getAnalyticsFixture("provider_failure");
  const query = twelveWeekQuery();
  const metric = calculateMetric(fixture.snapshot, query, "work_completed");
  const points = buildTrendPoints(fixture.snapshot, query, "work_completed");

  assert.equal(metric.status, "unsupported");
  assert.equal(points.length, 0);
  assert.equal(resolveTrendStatus(metric.status, "work_completed", 0), "unsupported");
});

test("keeps a fully covered event series available", () => {
  const fixture = getAnalyticsFixture("signature");
  const query = twelveWeekQuery();
  const metric = calculateMetric(fixture.snapshot, query, "work_completed");
  const points = buildTrendPoints(fixture.snapshot, query, "work_completed");

  assert.ok(points.length >= 2);
  assert.equal(resolveTrendStatus(metric.status, "work_completed", points.length), "available");
});
