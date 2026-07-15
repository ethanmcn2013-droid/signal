import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import {
  resolveCardOrder,
  restoreRecommendedCardOrder,
} from "./preferences";

describe("analytics card customization", () => {
  const defaults = ["attention", "milestones", "completed", "waiting"];

  test("puts pinned visible cards first, respects order, appends new defaults and hides cards", () => {
    const result = resolveCardOrder(defaults, {
      hiddenCardIds: ["waiting"],
      pinnedCardIds: ["completed", "waiting"],
      cardOrder: ["milestones", "unknown", "milestones", "attention"],
      updatedAt: null,
    });
    assert.deepEqual(result, ["completed", "milestones", "attention"]);
  });

  test("sanitizes unknown and duplicate identifiers", () => {
    assert.deepEqual(
      resolveCardOrder(defaults, {
        hiddenCardIds: ["unknown", "unknown"],
        pinnedCardIds: ["unknown", "attention", "attention"],
        cardOrder: ["unknown", "waiting", "waiting"],
        updatedAt: null,
      }),
      ["attention", "waiting", "milestones", "completed"],
    );
  });

  test("restores recommended defaults without preserving customization", () => {
    assert.deepEqual(restoreRecommendedCardOrder(["a", "a", "b"]), {
      hiddenCardIds: [],
      pinnedCardIds: [],
      cardOrder: ["a", "b"],
      updatedAt: null,
    });
  });
});
