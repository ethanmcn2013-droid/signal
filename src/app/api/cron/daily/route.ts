/**
 * /api/cron/daily — daily tick driver for briefing dispatch.
 *
 * Plan 6 · Cycle 6.5b.
 *
 * Vercel Cron fires this once a day at 06:00 UTC (vercel.json), which
 * is 07:00 Dublin BST — a sensible morning for the v1 user base.
 *
 * On each tick:
 *  1. Verify the request carries the CRON_SECRET bearer token.
 *  2. Iterate every onboarded analytics_users row.
 *  3. Build the daily briefing and dispatch via Resend.
 *  4. Return a JSON summary so Vercel's cron log shows what fired.
 *
 * Per-user-timezone scheduling (originally an hourly tick + local-hour
 * gate) is blocked by Vercel Hobby's daily-cron-only limit. The
 * `localHourMatches` helper is kept for when Pro upgrade or an external
 * cron unlocks the hourly tick — drop it back into the per-user loop
 * and the per-TZ gate works without further changes.
 *
 * No-signal days still send a briefing — PRODUCT.md §11 q4: cadence
 * stays unbroken, the empty render is its own answer.
 */

import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { analyticsUsers } from "@/server/db/schema";
import { buildBriefingForUser } from "@/server/briefing/build-for-user";
// Canonical dispatch path — unsubscribe tokens, RFC 8058, HTML+text render.
// server/briefing/dispatch.ts is kept as a deprecated stub; do not add new callers.
import { dispatchBriefing } from "@/lib/email/dispatch";

export const runtime = "nodejs";
// Cron handlers must not be cached — every tick is a fresh run.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // 1. Auth
  const authError = verifyCronAuth(request);
  if (authError) return authError;

  // 2. Iterate onboarded users
  const users = await db
    .select({
      clerkId: analyticsUsers.clerkId,
      timezone: analyticsUsers.timezone,
      linkedWorkspaceId: analyticsUsers.linkedWorkspaceId,
    })
    .from(analyticsUsers);

  const results: Array<{
    clerkId: string;
    status: string;
    detail?: string;
  }> = [];

  for (const user of users) {
    if (!user.linkedWorkspaceId) {
      results.push({ clerkId: user.clerkId, status: "skipped:not-onboarded" });
      continue;
    }
    try {
      const built = await buildBriefingForUser({
        clerkId: user.clerkId,
        cadence: "daily",
      });
      if (built.kind === "no-workspace") {
        results.push({ clerkId: user.clerkId, status: "skipped:no-workspace" });
        continue;
      }

      const email = await resolveEmailForClerkUser(user.clerkId);
      const dispatched = await dispatchBriefing({
        userId: user.clerkId,
        email: email ?? "",
        briefing: built.briefing,
        cadence: "daily",
        firstName: null,
      });

      results.push({
        clerkId: user.clerkId,
        status: dispatched.ok
          ? "skipped" in dispatched && dispatched.skipped
            ? `dispatch:skipped`
            : "dispatch:sent"
          : "dispatch:error",
        detail: !dispatched.ok
          ? dispatched.error
          : "skipped" in dispatched && dispatched.skipped
            ? dispatched.reason
            : "id" in dispatched
              ? dispatched.id
              : undefined,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({ clerkId: user.clerkId, status: "error", detail: message });
    }
  }

  return NextResponse.json({
    ok: true,
    tickAt: new Date().toISOString(),
    fired: results.filter((r) => r.status === "dispatch:sent").length,
    results,
  });
}

function verifyCronAuth(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // In dev with no secret, allow the call so the operator can test
    // the route without first provisioning a secret. In Vercel
    // (process.env.VERCEL=1), require it strictly.
    if (process.env.VERCEL === "1") {
      return NextResponse.json(
        { ok: false, error: "CRON_SECRET not configured" },
        { status: 503 },
      );
    }
    return null;
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return null;
}

/**
 * Kept for the future-Pro/external-cron path: returns true when `tz`'s
 * local hour matches `targetHour` at the moment of the cron tick. Drop
 * this gate back into the per-user loop above to restore per-TZ
 * morning scheduling once hourly cron is available.
 */
function localHourMatches(tz: string, targetHour: number): boolean {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      hour12: false,
    });
    const part = formatter.formatToParts(new Date()).find((p) => p.type === "hour");
    if (!part) return false;
    const hour = parseInt(part.value, 10) % 24;
    return hour === targetHour;
  } catch {
    return false;
  }
}

async function resolveEmailForClerkUser(clerkId: string): Promise<string | null> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(clerkId);
    return user.emailAddresses?.[0]?.emailAddress ?? null;
  } catch (err) {
    console.warn(`[cron] failed to resolve email for ${clerkId}`, err);
    return null;
  }
}
