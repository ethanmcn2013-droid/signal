import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { buildBriefing } from "./build";
import type { BriefingSource } from "./source";
import type { TaskSignal } from "./types";

const DAY = 86_400_000;
const NOW = 1_700_000_000_000;
const CTX = { userId: "u-test", email: "test@example.com" };

function source(signals: TaskSignal[]): BriefingSource {
  return { async getSignalsForUser() { return signals; } };
}

function task(overrides: Partial<TaskSignal> = {}): TaskSignal {
  return {
    id: "t",
    title: "t",
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
// Engine output
// ─────────────────────────────────────────────────────────────
describe("buildBriefing — empty + base shape", () => {
  test("isEmpty=true when nothing is triggered", async () => {
    const b = await buildBriefing(source([]), CTX, NOW);
    assert.equal(b.isEmpty, true);
    assert.equal(b.needsAttention.length, 0);
    assert.equal(b.movingWell.length, 0);
    assert.equal(b.quietRisks.length, 0);
    assert.equal(b.suggestedFocus.length, 0);
  });

  test("populates userId, generatedAt, greetingHour", async () => {
    const b = await buildBriefing(source([]), CTX, NOW);
    assert.equal(b.userId, CTX.userId);
    assert.equal(b.generatedAt, NOW);
    assert.ok(b.greetingHour >= 0 && b.greetingHour <= 23);
  });
});

describe("buildBriefing — bucket caps", () => {
  test("Needs attention is hard-capped at 3 items even with 5 due-soon", async () => {
    const signals = Array.from({ length: 5 }, (_, i) =>
      task({ id: `t${i}`, dueAt: NOW + i * 3_600_000 }),
    );
    const b = await buildBriefing(source(signals), CTX, NOW);
    assert.equal(b.needsAttention.length, 3);
  });

  test("Quiet risks is hard-capped at 3 items", async () => {
    const signals = Array.from({ length: 6 }, (_, i) =>
      task({ id: `t${i}`, idleDays: 5 + i }),
    );
    const b = await buildBriefing(source(signals), CTX, NOW);
    assert.equal(b.quietRisks.length, 3);
  });

  test("Moving well is hard-capped at 3 items", async () => {
    const signals = Array.from({ length: 5 }, (_, i) =>
      task({
        id: `t${i}`,
        lane: "shipped",
        movedToShippedAt: NOW - i * 3_600_000,
      }),
    );
    const b = await buildBriefing(source(signals), CTX, NOW);
    assert.equal(b.movingWell.length, 3);
  });

  test("Suggested focus is hard-capped at 3 items", async () => {
    const signals = [
      ...Array.from({ length: 3 }, (_, i) =>
        task({ id: `due-${i}`, dueAt: NOW + i * 3_600_000 }),
      ),
      ...Array.from({ length: 3 }, (_, i) =>
        task({ id: `stuck-${i}`, idleDays: 5 + i }),
      ),
    ];
    const b = await buildBriefing(source(signals), CTX, NOW);
    assert.equal(b.suggestedFocus.length, 3);
  });
});

describe("buildBriefing — bucket dedup", () => {
  test("a task that hits multiple triggers appears in only one bucket", async () => {
    // This task is BOTH overdue AND idle 10 days. It should land in
    // Needs attention (due-soon ranks higher) but NOT also in Quiet risks.
    const signals = [
      task({
        id: "double",
        idleDays: 10,
        dueAt: NOW - 2 * DAY,
      }),
    ];
    const b = await buildBriefing(source(signals), CTX, NOW);
    assert.equal(b.needsAttention.length, 1);
    assert.equal(b.quietRisks.length, 0);
  });
});

describe("buildBriefing — focus ranking", () => {
  test("due-soon ranks higher than stuck-work in the focus block", async () => {
    const signals = [
      task({ id: "stuck", idleDays: 30 }),
      task({ id: "due", dueAt: NOW + 6 * 3_600_000 }),
    ];
    const b = await buildBriefing(source(signals), CTX, NOW);
    assert.equal(b.suggestedFocus[0]?.id, "due");
  });

  test("overdue items rank higher than future-due items in focus block", async () => {
    const signals = [
      task({ id: "future", dueAt: NOW + 1.5 * DAY }),
      task({ id: "overdue", dueAt: NOW - 3 * DAY }),
    ];
    const b = await buildBriefing(source(signals), CTX, NOW);
    assert.equal(b.suggestedFocus[0]?.id, "overdue");
  });
});

describe("buildBriefing — prose rotation determinism", () => {
  test("same (user, day) → same phrasing across two calls", async () => {
    const signals = [task({ id: "x", idleDays: 5 })];
    const a = await buildBriefing(source(signals), CTX, NOW);
    const b = await buildBriefing(source(signals), CTX, NOW);
    assert.equal(a.quietRisks[0]?.text, b.quietRisks[0]?.text);
  });

  test("different days → potentially different phrasing", async () => {
    const signals = [task({ id: "x", idleDays: 5 })];
    const day0 = await buildBriefing(source(signals), CTX, NOW);
    const day7 = await buildBriefing(source(signals), CTX, NOW + 7 * DAY);
    // Not guaranteed to differ on every day-pair (3-phrasing rotation),
    // but at least one of the 7 day-shifts should change phrasing.
    const variants = new Set<string>();
    for (let d = 0; d < 7; d++) {
      const b = await buildBriefing(source(signals), CTX, NOW + d * DAY);
      const text = b.quietRisks[0]?.text;
      if (text) variants.add(text);
    }
    // Suppress unused-var warnings without weakening the suite.
    void day0;
    void day7;
    assert.ok(variants.size > 1, "rotation should produce at least 2 phrasings across 7 days");
  });
});

describe("buildBriefing — full Wedding 2026 shape", () => {
  test("produces a sensible Wedding-shaped briefing from the demo signals", async () => {
    // Mirrors the marketing demo's Wedding 2026 shape so the test
    // doubles as a regression check on the brief the marketing
    // surfaces describe.
    const signals: TaskSignal[] = [
      task({
        id: "florist",
        title: "Florist deposit",
        idleDays: 18,
      }),
      task({
        id: "catering",
        title: "Catering tasting",
        dueAt: NOW + 3 * DAY,
        idleDays: 4,
      }),
      task({
        id: "invitations",
        title: "Send invitations",
        dueAt: NOW - 14 * DAY,
      }),
      task({
        id: "save-the-dates",
        title: "Save-the-dates",
        lane: "shipped",
        movedToShippedAt: NOW - 6 * 3_600_000,
      }),
    ];
    const b = await buildBriefing(source(signals), CTX, NOW);
    assert.equal(b.isEmpty, false);
    assert.ok(b.needsAttention.length >= 1, "should surface the overdue invitations");
    assert.ok(b.movingWell.length >= 1, "should surface save-the-dates as just shipped");
    assert.ok(b.suggestedFocus.length >= 1);
  });
});
