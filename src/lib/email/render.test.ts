import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { render } from "@react-email/render";
import { BriefingEmail } from "./briefing-email";
import { renderBriefingText } from "./plain-text";
import type { Briefing } from "@/lib/briefing/types";

const NOW = 1_700_000_000_000;

const LINKS = {
  unsubscribeUrl: "https://example.test/u/abc",
  preferencesUrl: "https://example.test/app/settings/notifications",
  viewInBrowserUrl: "https://example.test/app/brief",
};

function brief(overrides: Partial<Briefing> = {}): Briefing {
  return {
    userId: "u-test",
    generatedAt: NOW,
    greetingHour: 8,
    needsAttention: [],
    movingWell: [],
    quietRisks: [],
    suggestedFocus: [],
    isEmpty: true,
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────
// Smoke tests on the email + plain-text render paths. We don't
// validate every layout pixel — just that the integrations don't
// silently throw and produce non-empty output. Real visual QA
// happens in /app/preview-email.
// ─────────────────────────────────────────────────────────────

describe("BriefingEmail HTML render", () => {
  test("renders empty-briefing to valid HTML", async () => {
    const html = await render(
      BriefingEmail({
        briefing: brief({ isEmpty: true }),
        cadence: "daily",
        ...LINKS,
      }),
    );
    assert.ok(html.length > 200, "html should not be empty");
    assert.match(html, /<html[^>]*>/i);
    assert.match(html, /signal studio\./);
  });

  test("renders full-bucket briefing without throwing", async () => {
    const full: Briefing = brief({
      isEmpty: false,
      needsAttention: [
        {
          id: "a1",
          text: "Florist deposit is held up",
          sourceLabel: "Tasks · Wedding 2026",
          trigger: "stuck-work",
          reasons: ["No update in 18 days."],
        },
      ],
      movingWell: [
        {
          id: "m1",
          text: "Save-the-dates landed",
          sourceLabel: "Tasks · Wedding 2026",
          trigger: "just-shipped",
          reasons: [],
        },
      ],
      quietRisks: [
        {
          id: "r1",
          text: "Music supplier hasn't replied in 9 days",
          sourceLabel: "Tasks · Wedding 2026",
          trigger: "stuck-work",
          reasons: [],
        },
      ],
      suggestedFocus: [
        {
          id: "a1",
          text: "Move florist deposit forward",
          due: "today",
          trigger: "stuck-work",
        },
      ],
    });
    const html = await render(
      BriefingEmail({
        briefing: full,
        cadence: "daily",
        ...LINKS,
      }),
    );
    assert.ok(html.length > 1000);
    assert.match(html, /Needs attention/);
    assert.match(html, /Moving well/);
    assert.match(html, /Quiet risks/);
    assert.match(html, /Suggested focus/);
    assert.match(html, /Florist deposit/);
  });

  test("uses firstName in greeting when provided", async () => {
    const html = await render(
      BriefingEmail({
        briefing: brief({ isEmpty: false, needsAttention: [] }),
        cadence: "daily",
        firstName: "Ethan",
        ...LINKS,
      }),
    );
    assert.match(html, /Good morning, Ethan\./);
  });

  test("falls back to impersonal greeting when firstName missing", async () => {
    const html = await render(
      BriefingEmail({
        briefing: brief({ isEmpty: false }),
        cadence: "daily",
        ...LINKS,
      }),
    );
    assert.match(html, /Good morning\./);
    assert.doesNotMatch(html, /Good morning, [A-Z]/);
  });

  test("weekly cadence renders Weekly Signal stamp", async () => {
    const html = await render(
      BriefingEmail({
        briefing: brief({ isEmpty: false }),
        cadence: "weekly",
        ...LINKS,
      }),
    );
    // Stamp is rendered uppercase (`WEEKLY SIGNAL · MON 12 MAY`).
    assert.match(html, /Weekly Signal/i);
  });

  test("daily cadence renders Daily Signal stamp", async () => {
    const html = await render(
      BriefingEmail({
        briefing: brief({ isEmpty: false }),
        cadence: "daily",
        ...LINKS,
      }),
    );
    assert.match(html, /Daily Signal/i);
  });

  test("includes all three footer links", async () => {
    const html = await render(
      BriefingEmail({
        briefing: brief({ isEmpty: false }),
        cadence: "daily",
        ...LINKS,
      }),
    );
    assert.ok(html.includes(LINKS.unsubscribeUrl));
    assert.ok(html.includes(LINKS.preferencesUrl));
    assert.ok(html.includes(LINKS.viewInBrowserUrl));
  });
});

describe("renderBriefingText (plain-text alt)", () => {
  test("produces non-empty plain-text for empty brief", () => {
    const text = renderBriefingText(
      brief({ isEmpty: true }),
      LINKS,
      "daily",
    );
    assert.ok(text.length > 50);
    assert.match(text, /signal studio/);
    assert.doesNotMatch(text, /<html/i, "should be plain text, not HTML");
  });

  test("includes bucket headers + items for full brief", () => {
    const text = renderBriefingText(
      brief({
        isEmpty: false,
        needsAttention: [
          {
            id: "a1",
            text: "Florist deposit is held up",
            sourceLabel: "Tasks · Wedding 2026",
            trigger: "stuck-work",
            reasons: [],
          },
        ],
      }),
      LINKS,
      "daily",
    );
    assert.match(text, /NEEDS ATTENTION/);
    assert.match(text, /Florist deposit/);
    assert.match(text, /Tasks · Wedding 2026/);
  });

  test("respects firstName in greeting", () => {
    const text = renderBriefingText(
      brief({ isEmpty: false }),
      LINKS,
      "daily",
      "Ethan",
    );
    assert.match(text, /Good morning, Ethan\./);
  });

  test("includes all three footer links", () => {
    const text = renderBriefingText(
      brief({ isEmpty: false }),
      LINKS,
      "daily",
    );
    assert.ok(text.includes(LINKS.unsubscribeUrl));
    assert.ok(text.includes(LINKS.preferencesUrl));
    assert.ok(text.includes(LINKS.viewInBrowserUrl));
  });

  test("renders SUGGESTED FOCUS block + due tags when focus items present", () => {
    const text = renderBriefingText(
      brief({
        isEmpty: false,
        suggestedFocus: [
          {
            id: "f1",
            text: "Confirm florist deposit Monday",
            due: "today",
            trigger: "stuck-work",
          },
          {
            id: "f2",
            text: "Send catering headcount by Friday",
            due: "by Friday",
            trigger: "due-soon",
          },
        ],
      }),
      LINKS,
      "daily",
    );
    assert.match(text, /SUGGESTED FOCUS/);
    assert.match(text, /Confirm florist deposit Monday.*\(today\)/);
    assert.match(text, /Send catering headcount by Friday.*\(by Friday\)/);
  });

  test("weekly cadence offers 'Send daily instead' in the footer", () => {
    const text = renderBriefingText(
      brief({ isEmpty: false }),
      LINKS,
      "weekly",
    );
    assert.match(text, /Send daily instead/);
    assert.doesNotMatch(text, /Send weekly instead/);
  });

  test("daily cadence offers 'Send weekly instead' in the footer", () => {
    const text = renderBriefingText(
      brief({ isEmpty: false }),
      LINKS,
      "daily",
    );
    assert.match(text, /Send weekly instead/);
    assert.doesNotMatch(text, /Send daily instead/);
  });

  test("weekly header reads 'Weekly brief'", () => {
    const text = renderBriefingText(
      brief({ isEmpty: false }),
      LINKS,
      "weekly",
    );
    assert.match(text, /Weekly brief/);
  });
});
