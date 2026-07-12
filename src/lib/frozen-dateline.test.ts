import assert from "node:assert/strict";
import test from "node:test";
import { formatFrozenDateline } from "./frozen-dateline";

test("frozen demo datelines derive the weekday from the date", () => {
  assert.equal(formatFrozenDateline("2026-07-04"), "SATURDAY · 4 JULY 2026");
  assert.equal(formatFrozenDateline("2026-07-03"), "FRIDAY · 3 JULY 2026");
});
