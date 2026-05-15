import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import type { BriefItem, Briefing, FocusItem } from "@/lib/briefing/types";
import { renderBriefingText } from "./plain-text";

const LINKS = {
  unsubscribeUrl: "https://analytics.signalstudio.ie/u/tok",
  preferencesUrl: "https://analytics.signalstudio.ie/app/settings/notifications",
  viewInBrowserUrl: "https://analytics.signalstudio.ie/app/brief",
};

function item(over: Partial<BriefItem> = {}): BriefItem {
  return {
    id: "t1",
    text: "Florist deposit has been held up for 9 days",
    sourceLabel: "Tasks · Wedding 2026",
    trigger: "stuck-work",
    reasons: [],
    ...over,
  };
}

function focus(over: Partial<FocusItem> = {}): FocusItem {
  return { id: "f1", text: "Confirm the florist", due: "today", trigger: "due-soon", ...over };
}

function brief(over: Partial<Briefing> = {}): Briefing {
  return {
    userId: "u1",
    generatedAt: 0,
    greetingHour: 9,
    needsAttention: [],
    movingWell: [],
    quietRisks: [],
    suggestedFocus: [],
    isEmpty: false,
    ...over,
  };
}

describe("renderBriefingText", () => {
  test("non-empty string for an empty brief, with greeting + footer", () => {
    const out = renderBriefingText(brief({ isEmpty: true }), LINKS, "daily");
    assert.ok(out.length > 0);
    assert.match(out, /Good morning\./);
    assert.match(out, /Three per block\. Hard cap\./);
  });

  test("bucket headers + items + provenance render", () => {
    const out = renderBriefingText(
      brief({
        needsAttention: [item({ text: "A overdue" })],
        movingWell: [item({ id: "m", text: "B shipped", sourceLabel: "Tasks · X" })],
        quietRisks: [item({ id: "q", text: "C stalled" })],
      }),
      LINKS,
      "daily",
    );
    assert.match(out, /NEEDS ATTENTION/);
    assert.match(out, /MOVING WELL/);
    assert.match(out, /QUIET RISKS/);
    assert.match(out, /A overdue/);
    assert.match(out, /from Tasks · X/);
  });

  test("suggested focus block shows the due tag", () => {
    const out = renderBriefingText(
      brief({ suggestedFocus: [focus({ text: "Send invitations", due: "tomorrow" })] }),
      LINKS,
      "daily",
    );
    assert.match(out, /SUGGESTED FOCUS/);
    assert.match(out, /Send invitations {2}\(tomorrow\)/);
  });

  test("greeting personalises with firstName", () => {
    const out = renderBriefingText(brief(), LINKS, "daily", "Ethan");
    assert.match(out, /Good morning, Ethan\./);
  });

  test("all three footer links present", () => {
    const out = renderBriefingText(brief(), LINKS, "daily");
    assert.ok(out.includes(LINKS.unsubscribeUrl));
    assert.ok(out.includes(LINKS.preferencesUrl));
    assert.ok(out.includes(LINKS.viewInBrowserUrl));
  });

  test("cadence flips the header + the swap-cadence offer", () => {
    const daily = renderBriefingText(brief(), LINKS, "daily");
    const weekly = renderBriefingText(brief(), LINKS, "weekly");
    assert.match(daily, /Daily brief/);
    assert.match(daily, /Send weekly instead/);
    assert.match(weekly, /Weekly brief/);
    assert.match(weekly, /Send daily instead/);
  });
});
