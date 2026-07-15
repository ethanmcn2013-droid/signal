import assert from "node:assert/strict";
import test from "node:test";
import { queriedHistoryWindow } from "./history-window";

const start = new Date("2026-03-23T09:00:00.000Z");
const end = new Date("2026-07-13T09:00:00.000Z");

test("an empty successful history query still covers the requested window", () => {
  assert.deepEqual(queriedHistoryWindow(start, end, false, null), {
    historyStartAt: start.toISOString(),
    historyEndAt: end.toISOString(),
  });
});

test("a truncated ascending query only claims coverage through its last event", () => {
  assert.deepEqual(
    queriedHistoryWindow(start, end, true, "2026-06-01T09:00:00.000Z"),
    {
      historyStartAt: start.toISOString(),
      historyEndAt: "2026-06-01T09:00:00.000Z",
    },
  );
});
