import assert from "node:assert/strict";
import { test } from "node:test";
import { AnalyticsApiError } from "./api-error";
import { parseAnalyticsQuery } from "./query";

function request(query: string): Request {
  return new Request(`https://analytics.signalstudio.ie/api/signal-studio/v1/trends?${query}`);
}

test("parser accepts repeated and comma-separated bounded filters", () => {
  const parsed = parseAnalyticsQuery(
    request("scope_type=workspace&scope_id=ws-1&owner=u-1&owner=u-2,u-3&status=doing,review"),
    new Date("2026-07-13T09:00:00.000Z"),
  );
  assert.deepEqual(parsed.ownerIds, ["u-1", "u-2", "u-3"]);
  assert.deepEqual(parsed.statuses, ["doing", "review"]);
});

test("parser accepts explicit ISO custom boundaries", () => {
  const parsed = parseAnalyticsQuery(
    request("scope_type=workspace&scope_id=ws-1&period=custom&start=2026-06-01T09%3A00%3A00.000Z&end=2026-07-01T09%3A00%3A00.000Z"),
  );
  assert.equal(parsed.start.toISOString(), "2026-06-01T09:00:00.000Z");
  assert.equal(parsed.end.toISOString(), "2026-07-01T09:00:00.000Z");
});

test("parser rejects an unbounded date range and missing tenant scope", () => {
  assert.throws(
    () => parseAnalyticsQuery(request("scope_type=workspace&scope_id=ws-1&period=custom&start=2024-01-01&end=2026-01-01")),
    AnalyticsApiError,
  );
  assert.throws(() => parseAnalyticsQuery(request("scope_type=workspace")), AnalyticsApiError);
});
