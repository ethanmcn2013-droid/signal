import "server-only";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";
import type { Briefing } from "@/lib/briefing/types";
import { BriefingEmail } from "./briefing-email";
import { generateUnsubscribeToken } from "./tokens";

const FROM = process.env.RESEND_FROM ?? "Signal Analytics <hello@signalstudio.ie>";

function siteBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://analytics.signalstudio.ie";
}

export type DispatchResult =
  | { ok: true; id: string; skipped?: false }
  | { ok: true; skipped: true; reason: string }
  | { ok: false; error: string };

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
}: {
  userId: string;
  email: string;
  briefing: Briefing;
  cadence: "daily" | "weekly";
}): Promise<DispatchResult> {
  if (briefing.isEmpty) {
    return { ok: true, skipped: true, reason: "empty-briefing" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: true, skipped: true, reason: "no-resend-key" };
  }

  // Rotate the unsubscribe token. This is the moment.
  const newToken = generateUnsubscribeToken();
  await db
    .update(userPreferences)
    .set({ unsubscribeToken: newToken, updatedAt: Date.now() })
    .where(eq(userPreferences.userId, userId));

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
    }),
  );

  const subject = subjectFor(briefing, cadence);

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject,
    html,
    headers: {
      // RFC 2369 + RFC 8058 — surfaces Gmail/Apple Mail's native
      // unsubscribe button at the TOP of the message.
      "List-Unsubscribe": `<${unsubscribePostUrl}>, <${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      "List-Id": "Signal Analytics Briefings <briefings.signalstudio.ie>",
    },
  });

  if (error) {
    return { ok: false, error: error.message ?? String(error) };
  }

  await db
    .update(userPreferences)
    .set({ lastSentAt: Date.now(), updatedAt: Date.now() })
    .where(eq(userPreferences.userId, userId));

  return { ok: true, id: data?.id ?? "" };
}

function subjectFor(b: Briefing, cadence: "daily" | "weekly"): string {
  // Lead with the most attention-worthy item, capped short.
  // Falls back to a calm timestamp if nothing's on fire.
  const headline =
    b.needsAttention[0]?.text ??
    b.suggestedFocus[0]?.text ??
    b.quietRisks[0]?.text;
  const date = new Date(b.generatedAt).toLocaleDateString("en-IE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const prefix = cadence === "weekly" ? "Weekly Signal" : "Signal";
  if (!headline) return `${prefix} · ${date}`;
  const trimmed = headline.length > 60 ? `${headline.slice(0, 57)}…` : headline;
  return `${prefix} · ${trimmed}`;
}
