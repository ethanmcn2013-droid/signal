"use server";

import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { buildBriefing } from "@/lib/briefing/build";
import { getBriefingSource } from "@/lib/briefing/get-source";
import { dispatchBriefing } from "@/lib/email/dispatch";
import { setCadence } from "@/lib/preferences";
import { getOrCreatePreferences } from "@/lib/preferences";
import { resolveEntitlement } from "@/lib/entitlements-shared/reads";
import { tierAtLeast } from "@/lib/entitlements-shared/tiers";
import type { Cadence } from "@/lib/db/schema";

export async function updateCadenceAction(cadence: Cadence) {
  await setCadence(cadence);
  revalidatePath("/app/settings/notifications");
}

export type SendTestResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

/**
 * Sends a one-off briefing to the signed-in user. Used by the
 * "Send a test now" button — the cheapest validation tool when the
 * cron's schedule doesn't match the moment you want to inspect.
 *
 * Honours the same brand promises as the cron: refuses to send on
 * empty briefings, gracefully no-ops on a missing Resend key.
 * Cadence is reported as "daily" for the test render so the email
 * matches the most common shape.
 */
export async function sendTestBriefingAction(): Promise<SendTestResult> {
  const prefs = await getOrCreatePreferences();

  // Same gate the cron enforces: email dispatch is workspace-tier+.
  // Without this, free users could spam test sends every 60s and
  // bypass the tier check that lives in the cron fanout (E-5).
  const { tier } = await resolveEntitlement(prefs.userId);
  if (!tierAtLeast(tier, "workspace")) {
    return {
      ok: false,
      message:
        "Email briefings are a Workspace feature. You can read every briefing in the app on any plan.",
    };
  }

  // Throttle: refuse a fresh test send within 60s of the last successful
  // send (cron or test). `lastSentAt` is the source of truth for "last
  // time Resend confirmed delivery." Prevents click-spam from running
  // up Resend cost.
  const COOLDOWN_MS = 60_000;
  if (prefs.lastSentAt && Date.now() - prefs.lastSentAt < COOLDOWN_MS) {
    const seconds = Math.ceil(
      (COOLDOWN_MS - (Date.now() - prefs.lastSentAt)) / 1000,
    );
    return {
      ok: false,
      message: `Just sent one. Try again in about ${seconds}s.`,
    };
  }

  const me = await currentUser();
  const source = getBriefingSource();
  const briefing = await buildBriefing(source, {
    userId: prefs.userId,
    email: prefs.email,
  });
  const result = await dispatchBriefing({
    userId: prefs.userId,
    email: prefs.email,
    briefing,
    cadence: "daily",
    firstName: me?.firstName ?? null,
  });
  if (!result.ok) {
    return { ok: false, message: `Could not send: ${result.error}` };
  }
  if ("skipped" in result && result.skipped) {
    if (result.reason === "empty-briefing") {
      return {
        ok: false,
        message:
          "Nothing on fire today — no test sent. (We don't send empty briefings, by design.)",
      };
    }
    if (result.reason === "no-resend-key") {
      return {
        ok: false,
        message:
          "Resend isn't configured for this environment, so no email went out.",
      };
    }
    return { ok: false, message: `Skipped: ${result.reason}` };
  }
  revalidatePath("/app/settings/notifications");
  return {
    ok: true,
    message: `Sent. Check ${prefs.email} — should land in under a minute.`,
  };
}
