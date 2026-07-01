import { strict as assert } from "node:assert";
import { afterEach, beforeEach, describe, test } from "node:test";
import { dispatchBriefing, type EmailSender } from "./dispatch";
import type { Briefing } from "@/lib/briefing/types";

const NOW = 1_700_000_000_000;

function emptyBriefing(): Briefing {
  return {
    userId: "u-test",
    generatedAt: NOW,
    greetingHour: 8,
    activeSourceCount: 0,
    needsAttention: [],
    movingWell: [],
    quietRisks: [],
    suggestedFocus: [],
    isEmpty: true,
  };
}

function fullBriefing(): Briefing {
  return {
    ...emptyBriefing(),
    isEmpty: false,
    needsAttention: [
      {
        id: "a1",
        text: "Florist deposit is overdue",
        sourceLabel: "Tasks · Wedding 2026",
        trigger: "due-soon",
        reasons: ["3 days overdue"],
      },
    ],
  };
}

const okSender: EmailSender = async () => ({
  data: { id: "fake-resend-id" },
  error: null,
});

// ─────────────────────────────────────────────────────────────
// dispatchBriefing — early-return branches don't need DB or net.
// We can test these without injecting a sender.
// ─────────────────────────────────────────────────────────────

describe("dispatchBriefing — refusals", () => {
  test("empty briefing → skipped: empty-briefing (no sender called)", async () => {
    let senderCalled = false;
    const result = await dispatchBriefing({
      userId: "u",
      email: "x@example.test",
      briefing: emptyBriefing(),
      cadence: "daily",
      sender: async () => {
        senderCalled = true;
        return { data: { id: "x" }, error: null };
      },
      persist: false,
    });
    assert.equal(result.ok, true);
    assert.ok("skipped" in result && result.skipped === true);
    if ("reason" in result) assert.equal(result.reason, "empty-briefing");
    assert.equal(senderCalled, false);
  });

  test("no sender + no RESEND_API_KEY → skipped: no-resend-key", async () => {
    const original = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;
    try {
      const result = await dispatchBriefing({
        userId: "u",
        email: "x@example.test",
        briefing: fullBriefing(),
        cadence: "daily",
        persist: false,
      });
      assert.equal(result.ok, true);
      assert.ok("skipped" in result && result.skipped === true);
      if ("reason" in result) assert.equal(result.reason, "no-resend-key");
    } finally {
      if (original !== undefined) process.env.RESEND_API_KEY = original;
    }
  });
});

// ─────────────────────────────────────────────────────────────
// dispatchBriefing — error branch via injected sender.
// Crucially: no DB write happens on the error path, so persist:false
// doesn't matter here — the error guard is upstream of the write.
// ─────────────────────────────────────────────────────────────

describe("dispatchBriefing — error branch via injected sender", () => {
  test("sender returns error → { ok: false, error }", async () => {
    const result = await dispatchBriefing({
      userId: "u",
      email: "x@example.test",
      briefing: fullBriefing(),
      cadence: "daily",
      sender: async () => ({
        data: null,
        error: { message: "rate_limited", name: "ResendError" },
      }),
      persist: false,
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /rate_limited/);
  });

  test("sender returns error without message → error is still a string", async () => {
    const result = await dispatchBriefing({
      userId: "u",
      email: "x@example.test",
      briefing: fullBriefing(),
      cadence: "daily",
      sender: async () => ({ data: null, error: { name: "Weird" } }),
      persist: false,
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(typeof result.error, "string");
  });
});

// ─────────────────────────────────────────────────────────────
// Sender contract — the headers, from, replyTo, subject the cron
// actually puts on the wire. Locks the contract so a future
// refactor that drops List-Unsubscribe-Post would be caught.
// ─────────────────────────────────────────────────────────────

describe("dispatchBriefing — sender receives the right contract", () => {
  let captured: Parameters<EmailSender>[0] | null = null;
  const captureSender: EmailSender = async (params) => {
    captured = params;
    return { data: { id: "fake" }, error: null };
  };

  beforeEach(() => {
    captured = null;
  });

  test("sends to the recipient email", async () => {
    await dispatchBriefing({
      userId: "u",
      email: "florist@harbour-house.example",
      briefing: fullBriefing(),
      cadence: "daily",
      sender: captureSender,
      persist: false,
    });
    assert.equal(captured?.to, "florist@harbour-house.example");
  });

  test("sets Reply-To to hello@signalstudio.ie by default", async () => {
    await dispatchBriefing({
      userId: "u",
      email: "x@example.test",
      briefing: fullBriefing(),
      cadence: "daily",
      sender: captureSender,
      persist: false,
    });
    assert.match(captured?.replyTo ?? "", /hello@signalstudio\.ie/);
  });

  test("includes List-Unsubscribe + List-Unsubscribe-Post headers (RFC 8058)", async () => {
    await dispatchBriefing({
      userId: "u",
      email: "x@example.test",
      briefing: fullBriefing(),
      cadence: "daily",
      sender: captureSender,
      persist: false,
    });
    assert.match(captured?.headers["List-Unsubscribe"] ?? "", /^<.+>, <.+>$/);
    assert.equal(
      captured?.headers["List-Unsubscribe-Post"],
      "List-Unsubscribe=One-Click",
    );
  });

  test("subject leads with cadence prefix", async () => {
    await dispatchBriefing({
      userId: "u",
      email: "x@example.test",
      briefing: fullBriefing(),
      cadence: "weekly",
      sender: captureSender,
      persist: false,
    });
    assert.match(captured?.subject ?? "", /^Weekly Signal /);
  });

  test("daily cadence produces Daily Signal subject prefix", async () => {
    await dispatchBriefing({
      userId: "u",
      email: "x@example.test",
      briefing: fullBriefing(),
      cadence: "daily",
      sender: captureSender,
      persist: false,
    });
    assert.match(captured?.subject ?? "", /^Daily Signal /);
  });

  test("html and text are both populated (multipart/alternative)", async () => {
    await dispatchBriefing({
      userId: "u",
      email: "x@example.test",
      briefing: fullBriefing(),
      cadence: "daily",
      sender: captureSender,
      persist: false,
    });
    assert.ok((captured?.html?.length ?? 0) > 500);
    assert.ok((captured?.text?.length ?? 0) > 100);
    assert.doesNotMatch(captured?.text ?? "", /<html/i);
  });
});
