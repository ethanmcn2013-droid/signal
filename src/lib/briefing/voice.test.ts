import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import type { Briefing } from "./types";
import { graceNote, greeting, loadLine, summaryLine } from "./voice";

function brief(overrides: Partial<Briefing> = {}): Briefing {
  return {
    userId: "u_1",
    generatedAt: 0,
    greetingHour: 9,
    activeSourceCount: 0,
    needsAttention: [],
    movingWell: [],
    quietRisks: [],
    suggestedFocus: [],
    isEmpty: false,
    ...overrides,
  };
}

describe("greeting", () => {
  test("time-of-day base phrase", () => {
    assert.equal(greeting(3), "It's late.");
    assert.equal(greeting(9), "Good morning.");
    assert.equal(greeting(14), "Good afternoon.");
    assert.equal(greeting(20), "Good evening.");
  });

  test("personalises with firstName when present", () => {
    assert.equal(greeting(9, "Ethan"), "Good morning, Ethan.");
  });

  test("falls back to impersonal when firstName is null/empty", () => {
    assert.equal(greeting(9, null), "Good morning.");
    assert.equal(greeting(9, ""), "Good morning.");
  });

  test("boundary hours land in the right bucket", () => {
    assert.equal(greeting(5), "Good morning.");
    assert.equal(greeting(12), "Good afternoon.");
    assert.equal(greeting(17), "Good evening.");
  });
});

describe("loadLine", () => {
  test("silent when nothing needs attention or watching", () => {
    assert.equal(loadLine(brief({ activeSourceCount: 12 })), "");
  });

  test("summarises the surfaced load with source count", () => {
    assert.equal(
      loadLine(
        brief({
          activeSourceCount: 18,
          needsAttention: [{}, {}] as never[],
          quietRisks: [{}] as never[],
        }),
      ),
      "Moderate day. 3 signals surfaced from 18 active items.",
    );
  });

  test("keeps the receipt when source count is unavailable", () => {
    assert.equal(
      loadLine(brief({ needsAttention: [{}] as never[] })),
      "Light day. 1 signal surfaced.",
    );
  });
});

describe("summaryLine", () => {
  test("silent on a quiet day - nothing pulling, no filler", () => {
    // Silence is the signal. Empty string lets EmptyState carry the frame.
    assert.equal(summaryLine(brief()), "");
  });

  test("still silent when only moving-well has items", () => {
    // moving-well items no longer rescue the line; the morning that
    // has nothing pulling has nothing to summarise.
    assert.equal(summaryLine(brief({ movingWell: [{} as never] })), "");
  });

  test("risk-only day singular vs plural", () => {
    assert.equal(
      summaryLine(brief({ quietRisks: [{} as never] })),
      "No urgent pulls. One quiet risk is worth watching.",
    );
    assert.equal(
      summaryLine(brief({ quietRisks: [{}, {}] as never[] })),
      "No urgent pulls. Two quiet risks are worth watching.",
    );
  });

  test("attention count drives the line", () => {
    assert.equal(
      summaryLine(brief({ needsAttention: [{}] as never[] })),
      "One thing needs attention.",
    );
    assert.equal(
      summaryLine(brief({ needsAttention: [{}, {}] as never[] })),
      "Two things need attention.",
    );
    assert.equal(
      summaryLine(brief({ needsAttention: [{}, {}, {}] as never[] })),
      "Three things need attention.",
    );
    assert.equal(
      summaryLine(
        brief({
          needsAttention: [{}, {}, {}] as never[],
          quietRisks: [{}] as never[],
        }),
      ),
      "Three things need attention. One quiet risk is building.",
    );
  });
});

describe("graceNote", () => {
  test("empty brief", () => {
    assert.equal(graceNote(brief({ isEmpty: true })), "That's the read.");
  });

  test("no focus block", () => {
    assert.equal(graceNote(brief()), "That's the read — good day.");
  });

  test("two-plus attention items steers to the focus block", () => {
    assert.equal(
      graceNote(
        brief({
          needsAttention: [{}, {}] as never[],
          suggestedFocus: [{}] as never[],
        }),
      ),
      "Take the focus block first. The rest can wait.",
    );
  });

  test("default sign-off with a focus block", () => {
    assert.equal(
      graceNote(brief({ suggestedFocus: [{}] as never[] })),
      "That's the read. Open Tasks when you're ready.",
    );
  });
});
