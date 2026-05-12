import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import {
  detectDueSoon,
  detectJustShipped,
  detectOverload,
  detectStuckWork,
} from "./triggers";
import type { TaskSignal } from "./types";

// ─────────────────────────────────────────────────────────────
// Test data builders — terse, named. Same shape Tasks DB returns
// after the source maps it.
// ─────────────────────────────────────────────────────────────
const DAY = 86_400_000;
const NOW = 1_700_000_000_000; // fixed clock so tests are deterministic

function makeTask(overrides: Partial<TaskSignal> = {}): TaskSignal {
  return {
    id: "t-default",
    title: "Default task",
    lane: "in-flight",
    priority: 2,
    dueAt: null,
    idleDays: 0,
    commentCount: 0,
    blockedBy: [],
    sourceLabel: "Tasks · Test",
    movedToShippedAt: null,
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────
// detectStuckWork
// ─────────────────────────────────────────────────────────────
describe("detectStuckWork", () => {
  test("flags an open task idle ≥ 3 days", () => {
    const out = detectStuckWork([
      makeTask({ id: "a", idleDays: 5, lane: "in-flight" }),
    ]);
    assert.equal(out.length, 1);
    assert.equal(out[0].task.id, "a");
    assert.equal(out[0].trigger, "stuck-work");
  });

  test("does not flag idle < 3 days", () => {
    const out = detectStuckWork([
      makeTask({ idleDays: 2, lane: "in-flight" }),
    ]);
    assert.equal(out.length, 0);
  });

  test("does not flag shipped tasks even if idle", () => {
    const out = detectStuckWork([
      makeTask({ idleDays: 10, lane: "shipped" }),
    ]);
    assert.equal(out.length, 0);
  });

  test("does not flag tasks blocked by others — different problem", () => {
    const out = detectStuckWork([
      makeTask({ idleDays: 10, blockedBy: ["other-task"] }),
    ]);
    assert.equal(out.length, 0);
  });

  test("higher idleDays raises severity", () => {
    const [low] = detectStuckWork([makeTask({ id: "low", idleDays: 4 })]);
    const [high] = detectStuckWork([makeTask({ id: "high", idleDays: 30 })]);
    assert.ok(high.severity > low.severity);
  });

  test("higher priority (lower number) raises severity at same idleDays", () => {
    const [p0] = detectStuckWork([
      makeTask({ id: "p0", idleDays: 5, priority: 0 }),
    ]);
    const [p3] = detectStuckWork([
      makeTask({ id: "p3", idleDays: 5, priority: 3 }),
    ]);
    assert.ok(p0.severity > p3.severity);
  });
});

// ─────────────────────────────────────────────────────────────
// detectDueSoon
// ─────────────────────────────────────────────────────────────
describe("detectDueSoon", () => {
  test("flags tasks due today", () => {
    const out = detectDueSoon(
      [makeTask({ id: "today", dueAt: NOW + 6 * 3_600_000 })],
      NOW,
    );
    assert.equal(out.length, 1);
    assert.equal(out[0].trigger, "due-soon");
  });

  test("flags tasks due within 2 days", () => {
    const out = detectDueSoon(
      [makeTask({ id: "tomorrow", dueAt: NOW + 1.5 * DAY })],
      NOW,
    );
    assert.equal(out.length, 1);
  });

  test("does not flag tasks more than 2 days out", () => {
    const out = detectDueSoon(
      [makeTask({ dueAt: NOW + 5 * DAY })],
      NOW,
    );
    assert.equal(out.length, 0);
  });

  test("flags overdue tasks (negative daysOut)", () => {
    const out = detectDueSoon(
      [makeTask({ id: "overdue", dueAt: NOW - 3 * DAY })],
      NOW,
    );
    assert.equal(out.length, 1);
  });

  test("ignores tasks without a dueAt", () => {
    const out = detectDueSoon([makeTask({ dueAt: null })], NOW);
    assert.equal(out.length, 0);
  });

  test("ignores shipped tasks", () => {
    const out = detectDueSoon(
      [makeTask({ dueAt: NOW + DAY, lane: "shipped" })],
      NOW,
    );
    assert.equal(out.length, 0);
  });

  test("overdue items outweigh due-today items in severity", () => {
    const [today] = detectDueSoon(
      [makeTask({ id: "today", dueAt: NOW + 4 * 3_600_000 })],
      NOW,
    );
    const [overdue] = detectDueSoon(
      [makeTask({ id: "overdue", dueAt: NOW - 5 * DAY })],
      NOW,
    );
    assert.ok(overdue.severity > today.severity);
  });

  test("more overdue days raises severity", () => {
    const [oneDay] = detectDueSoon(
      [makeTask({ id: "1d", dueAt: NOW - 1 * DAY })],
      NOW,
    );
    const [tenDays] = detectDueSoon(
      [makeTask({ id: "10d", dueAt: NOW - 10 * DAY })],
      NOW,
    );
    assert.ok(tenDays.severity > oneDay.severity);
  });
});

// ─────────────────────────────────────────────────────────────
// detectJustShipped
// ─────────────────────────────────────────────────────────────
describe("detectJustShipped", () => {
  test("flags tasks shipped within 24h", () => {
    const out = detectJustShipped(
      [
        makeTask({
          id: "fresh",
          lane: "shipped",
          movedToShippedAt: NOW - 6 * 3_600_000,
        }),
      ],
      NOW,
    );
    assert.equal(out.length, 1);
    assert.equal(out[0].trigger, "just-shipped");
  });

  test("does not flag stale shipped tasks", () => {
    const out = detectJustShipped(
      [
        makeTask({
          lane: "shipped",
          movedToShippedAt: NOW - 5 * DAY,
        }),
      ],
      NOW,
    );
    assert.equal(out.length, 0);
  });

  test("does not flag non-shipped tasks regardless of movedToShippedAt", () => {
    const out = detectJustShipped(
      [
        makeTask({
          lane: "in-flight",
          movedToShippedAt: NOW - 1 * 3_600_000,
        }),
      ],
      NOW,
    );
    assert.equal(out.length, 0);
  });

  test("ignores shipped tasks with null movedToShippedAt", () => {
    const out = detectJustShipped(
      [makeTask({ lane: "shipped", movedToShippedAt: null })],
      NOW,
    );
    assert.equal(out.length, 0);
  });
});

// ─────────────────────────────────────────────────────────────
// detectOverload
// ─────────────────────────────────────────────────────────────
describe("detectOverload", () => {
  test("flags when > 5 in-flight (or review) tasks", () => {
    const tasks = Array.from({ length: 7 }, (_, i) =>
      makeTask({ id: `t${i}`, lane: "in-flight" }),
    );
    const out = detectOverload(tasks);
    assert.equal(out.length, 1);
    assert.equal(out[0].trigger, "overload");
    assert.equal(out[0].task.id, "synthetic:overload");
    assert.match(out[0].task.title, /7 items in flight/);
  });

  test("does not flag at exactly 5 in-flight", () => {
    const tasks = Array.from({ length: 5 }, (_, i) =>
      makeTask({ id: `t${i}`, lane: "in-flight" }),
    );
    assert.equal(detectOverload(tasks).length, 0);
  });

  test("counts 'review' lane toward the in-flight threshold", () => {
    const mixed = [
      ...Array.from({ length: 4 }, (_, i) =>
        makeTask({ id: `i${i}`, lane: "in-flight" }),
      ),
      ...Array.from({ length: 2 }, (_, i) =>
        makeTask({ id: `r${i}`, lane: "review" }),
      ),
    ];
    assert.equal(detectOverload(mixed).length, 1);
  });

  test("ignores shipped / next tasks in the count", () => {
    const mixed = [
      ...Array.from({ length: 4 }, (_, i) =>
        makeTask({ id: `i${i}`, lane: "in-flight" }),
      ),
      ...Array.from({ length: 5 }, (_, i) =>
        makeTask({ id: `s${i}`, lane: "shipped" }),
      ),
      ...Array.from({ length: 5 }, (_, i) =>
        makeTask({ id: `n${i}`, lane: "next" }),
      ),
    ];
    assert.equal(detectOverload(mixed).length, 0);
  });

  test("more overload raises severity", () => {
    const six = Array.from({ length: 6 }, (_, i) =>
      makeTask({ id: `t${i}`, lane: "in-flight" }),
    );
    const ten = Array.from({ length: 10 }, (_, i) =>
      makeTask({ id: `t${i}`, lane: "in-flight" }),
    );
    const [s6] = detectOverload(six);
    const [s10] = detectOverload(ten);
    assert.ok(s10.severity > s6.severity);
  });
});
