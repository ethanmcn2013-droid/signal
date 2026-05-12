"use server";

import { revalidatePath } from "next/cache";
import { buildBriefing } from "@/lib/briefing/build";
import { getBriefingSource } from "@/lib/briefing/get-source";
import { dispatchBriefing } from "@/lib/email/dispatch";
import { setCadence } from "@/lib/preferences";
import { getOrCreatePreferences } from "@/lib/preferences";
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
