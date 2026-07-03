// Note: `import "server-only"` would protect against accidental
// client-bundle import, but it throws at Node-test import time.
// dispatch.ts is only imported by route handlers and server actions
// (both already server-only), so this protection is redundant in
// practice. Removed so the test suite can mount it directly.
import { Resend } from "resend";
import { render } from "@react-email/render";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";
import type { Briefing } from "@/lib/briefing/types";
import { BriefingEmail } from "./briefing-email";
import { renderBriefingText } from "./plain-text";
import { generateUnsubscribeToken } from "./tokens";

const REPLY_TO = process.env.RESEND_REPLY_TO ?? "hello@signalstudio.ie";

const FROM = process.env.RESEND_FROM ?? "Signal <hello@signalstudio.ie>";

function siteBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://signal.signalstudio.ie";
}

// Memoised Resend client, keyed on the API key so a key rotation
// inside a long-lived process doesn't keep using the stale client.
let _resend: { key: string; client: Resend } | null = null;
function getResend(apiKey: string): Resend {
  if (!_resend || _resend.key !== apiKey) {
    _resend = { key: apiKey, client: new Resend(apiKey) };
  }
  return _resend.client;
}

export type DispatchResult =
  | { ok: true; id: string; skipped?: false }
  | { ok: true; skipped: true; reason: string }
  | { ok: false; error: string };

/**
 * The minimal shape we need from the email sender. Lets tests
 * inject a fake without hauling in the real Resend SDK or mocking
 * the network.
 */
export type EmailSender = (params: {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  html: string;
  text: string;
  headers: Record<string, string>;
}) => Promise<{
  data?: { id?: string } | null;
  error?: { message?: string; name?: string } | null;
}>;

/**
 * Send one briefing to one user.
 *
 * Side effects:
 *  - Rotates the unsubscribe token before composing the email so
 *    every send has a unique unsubscribe URL. The old token is dead
 *    the moment we hit send.
 *  - Updates lastSentAt on success.
 *
 * Refuses to send:
 *  - When the briefing is empty (brand promise).
 *  - When RESEND_API_KEY is unset (graceful no-key fallback for dev).
 */
export async function dispatchBriefing({
  userId,
  email,
  briefing,
  cadence,
  firstName,
  sender,
  persist = true,
}: {
  userId: string;
  email: string;
  briefing: Briefing;
  cadence: "daily" | "weekly";
  firstName?: string | null;
  /** Inject a fake sender to test without calling Resend. When
   *  omitted, the default Resend client is used (requires
   *  RESEND_API_KEY). */
  sender?: EmailSender;
  /** When false, skip the DB write that rotates the unsubscribe
   *  token + sets lastSentAt. Useful for tests that exercise the
   *  send path without a real Turso connection. Default: true. */
  persist?: boolean;
}): Promise<DispatchResult> {
  if (briefing.isEmpty) {
    return { ok: true, skipped: true, reason: "empty-briefing" };
  }

  // Resolve the sender. An injected sender bypasses the env-key
  // check; the default path requires RESEND_API_KEY.
  let send: EmailSender;
  if (sender) {
    send = sender;
  } else {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // In production a missing key is a real misconfiguration, not a
      // benign dev no-op. Returning a "skipped" success here would let
      // the cron report ok:true while zero emails go out for days.
      if (process.env.NODE_ENV === "production") {
        return { ok: false, error: "RESEND_API_KEY missing in production" };
      }
      return { ok: true, skipped: true, reason: "no-resend-key" };
    }
    const resend = getResend(apiKey);
    send = (p) => resend.emails.send(p);
  }

  // Generate the new token but don't write it to the DB yet. We rotate
  // only on confirmed Resend success, if Resend errors, the token
  // already in the user's inbox (from a prior email) stays valid.
  const newToken = generateUnsubscribeToken();

  const base = siteBaseUrl();
  const unsubscribeUrl = `${base}/u/${encodeURIComponent(newToken)}`;
  const unsubscribePostUrl = `${base}/api/unsubscribe/${encodeURIComponent(newToken)}`;
  const preferencesUrl = `${base}/app/settings/notifications`;
  const viewInBrowserUrl = `${base}/app/brief`;

  const html = await render(
    BriefingEmail({
      briefing,
      unsubscribeUrl,
      preferencesUrl,
      viewInBrowserUrl,
      cadence,
      firstName,
    }),
  );
  const text = renderBriefingText(
    briefing,
    { unsubscribeUrl, preferencesUrl, viewInBrowserUrl },
    cadence,
    firstName,
  );

  const subject = subjectFor(briefing, cadence);

  const { data, error } = await send({
    from: FROM,
    to: email,
    replyTo: REPLY_TO,
    subject,
    html,
    text,
    headers: {
      // RFC 2369 + RFC 8058, surfaces Gmail/Apple Mail's native
      // unsubscribe button at the TOP of the message.
      "List-Unsubscribe": `<${unsubscribePostUrl}>, <${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      "List-Id": "Signal Briefings <briefings.signalstudio.ie>",
    },
  });

  if (error) {
    return { ok: false, error: error.message ?? String(error) };
  }

  // Resend confirmed delivery, now safe to rotate the token and record lastSentAt.
  // The email in the user's inbox carries the new token; the old one is now dead.
  //
  // If the DB write fails after a successful send, the inbox has the new
  // token but the DB still references the old one. The user's unsubscribe
  // link in this specific email would 404. We log loudly but still return
  // ok: true, the send succeeded, idempotency-cutoff still holds, and the
  // next dispatch will rotate cleanly.
  if (persist) {
    try {
      await db
        .update(userPreferences)
        .set({ unsubscribeToken: newToken, lastSentAt: Date.now(), updatedAt: Date.now() })
        .where(eq(userPreferences.userId, userId));
    } catch (err) {
      console.error(
        "[dispatch] post-send DB write failed, unsubscribe in this email may 404 until next rotation:",
        { userId, error: String(err) },
      );
    }
  }

  return { ok: true, id: data?.id ?? "" };
}

function subjectFor(b: Briefing, cadence: "daily" | "weekly"): string {
  // Calm, brand-consistent, low-noise subject. Same shape every day.
  // The content does the talking once the email is opened, the
  // subject's job is to be recognizable in the inbox, not alarming.
  //
  // Earlier iterations led with the loudest item ("Signal · Send
  // invitations is 14 days overdue"), Gmail flagged it as spam-like
  // and the brand never just calls itself "Signal" alone (collides
  // with Signal Messenger). Fixed both at once.
  const date = new Date(b.generatedAt).toLocaleDateString("en-IE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const prefix = cadence === "weekly" ? "Weekly Signal" : "Daily Signal";
  const tail = subjectTail(b);
  return tail ? `${prefix} · ${date} · ${tail}` : `${prefix} · ${date}`;
}

function subjectTail(b: Briefing): string {
  // A short, neutral shape-of-the-day clause that adds context
  // without naming the alarming item. Empty when nothing's pulling.
  const att = b.needsAttention.length;
  if (att >= 3) return "three things to watch";
  if (att === 2) return "two things to watch";
  if (att === 1) return "one thing to watch";
  if (b.quietRisks.length > 0) return "quiet morning";
  return "";
}
