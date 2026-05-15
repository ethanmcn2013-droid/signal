import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { TIER_LABEL, TIER_RANK, tierAtLeast } from "./tiers";

describe("TIER_RANK", () => {
  test("free is the floor, studio is the ceiling", () => {
    assert.equal(TIER_RANK.free, 0);
    assert.equal(TIER_RANK.studio, 4);
  });

  test("ranking is strictly monotonic in the documented order", () => {
    const order = ["free", "event", "wedding", "workspace", "studio"] as const;
    for (let i = 1; i < order.length; i++) {
      assert.ok(
        TIER_RANK[order[i]] > TIER_RANK[order[i - 1]],
        `${order[i]} should outrank ${order[i - 1]}`,
      );
    }
  });
});

describe("tierAtLeast", () => {
  // This is the gate the cron + test-send action both call to decide
  // who receives email. A regression here silently changes who pays.
  test("equal tier passes", () => {
    assert.equal(tierAtLeast("workspace", "workspace"), true);
  });

  test("higher tier clears a lower bar", () => {
    assert.equal(tierAtLeast("studio", "workspace"), true);
    assert.equal(tierAtLeast("workspace", "free"), true);
  });

  test("lower tier does not clear a higher bar", () => {
    assert.equal(tierAtLeast("free", "workspace"), false);
    assert.equal(tierAtLeast("event", "workspace"), false);
    assert.equal(tierAtLeast("wedding", "workspace"), false);
  });

  test("free user is gated out of the email bar", () => {
    assert.equal(tierAtLeast("free", "workspace"), false);
  });
});

describe("TIER_LABEL", () => {
  test("every tier has a human label", () => {
    for (const tier of Object.keys(TIER_RANK) as (keyof typeof TIER_RANK)[]) {
      assert.equal(typeof TIER_LABEL[tier], "string");
      assert.ok(TIER_LABEL[tier].length > 0);
    }
  });
});
