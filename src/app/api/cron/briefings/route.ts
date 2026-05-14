import "server-only";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { clerkClient } from "@clerk/nextjs/server";
import { and, eq, isNull, lt, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";
import { buildBriefing } from "@/lib/briefing/build";
import { getBriefingSource } from "@/lib/briefing/get-source";
import { dispatchBriefing } from "@/lib/email/dispatch";
import { pingStudio } from "@/lib/ops/ping-studio";
import { resolveEntitlement } from "@/lib/entitlements-shared/reads";
import { tierAtLeast } from "@/lib/entitlements-shared/tiers";

type ClerkLike = Awaited<ReturnType<typeof clerkClient>>;

async function fetchFirstName(
  clerk: ClerkLike,
  userId: string,
): Promise<string | null> {
  try {
    const user = await clerk.users.getUser(userId);
    return user.firstName ?? null;
  } catch {
    // If the userId is a test row or a deleted Clerk user, just
    // skip personalisation rather than break the whole fanout.
    return null;
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Daily fanout. Vercel cron hits this once a day at 06:00 UTC.
 *
 * Always dispatches to users with cadence='daily'.
 * On Mondays (UTC), also dispatches to users with cadence='weekly'.
 * Users with cadence='off' are never touched.
 *
 * Source: getBriefingSource() selects tasksDbSource when TASKS_DATABASE_URL
 * and TASKS_AUTH_TOKEN are set, otherwise emptySource (no mock data in prod).
 */
export async function POST(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  // Guard: CRON_SECRET must be set, and the buffers must be the same length
  // before timingSafeEqual — different lengths short-circuit to reject.
  if (
    !process.env.CRON_SECRET ||
    auth.length !== expected.length ||
    !timingSafeEqual(Buffer.from(auth), Buffer.from(expected))
  ) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const isMonday = new Date(now).getUTCDay() === 1;

  // Idempotency: skip rows we've sent to in the last 20h. Survives a
  // double-fire (Vercel retry, manual re-trigger, deploy rotation)
  // without spamming subscribers. Threshold is < 24h so a daily run
  // that slips by a few hours still goes out.
  const idempotencyCutoff = now - 20 * 60 * 60 * 1000;
  const notRecentlySent = or(
    isNull(userPreferences.lastSentAt),
    lt(userPreferences.lastSentAt, idempotencyCutoff),
  );

  const targets = await Promise.all([
    db
      .select()
      .from(userPreferences)
      .where(and(eq(userPreferences.cadence, "daily"), notRecentlySent)),
    isMonday
      ? db
          .select()
          .from(userPreferences)
          .where(and(eq(userPreferences.cadence, "weekly"), notRecentlySent))
      : Promise.resolve([]),
  ]);

  const results: Array<{
    userId: string;
    cadence: "daily" | "weekly";
    result: Awaited<ReturnType<typeof dispatchBriefing>>;
  }> = [];

  const source = getBriefingSource();
  const clerk = await clerkClient();

  // Concurrency: process up to 6 users at a time. Resend latency is
  // the dominant cost (~200-400ms/call) and the serial loop fell off
  // a cliff near ~80-100 users on maxDuration=60. Capped at 6 so we
  // stay below Resend's per-second rate limit and don't fan out so
  // wide that one bad user's signals query starves the rest.
  const CONCURRENCY = 6;

  async function processOne(
    cadenceLabel: "daily" | "weekly",
    row: { userId: string; email: string },
  ) {
    // E-5: gate email dispatch on workspace-tier. Free users can view
    // their briefing on /app; only paid tiers receive emails. Cron is
    // the only place email is dispatched, so the gate goes here.
    const { tier } = await resolveEntitlement(row.userId);
    if (!tierAtLeast(tier, "workspace")) {
      return {
        userId: row.userId,
        cadence: cadenceLabel,
        result: {
          ok: true as const,
          skipped: true as const,
          reason: "free-tier-no-email" as const,
        },
      };
    }
    const firstName = await fetchFirstName(clerk, row.userId);
    const briefing = await buildBriefing(
      source,
      { userId: row.userId, email: row.email },
      now,
    );
    const result = await dispatchBriefing({
      userId: row.userId,
      email: row.email,
      briefing,
      cadence: cadenceLabel,
      firstName,
    });
    return { userId: row.userId, cadence: cadenceLabel, result };
  }

  for (const [cadenceLabel, rows] of [
    ["daily", targets[0]],
    ["weekly", targets[1]],
  ] as const) {
    for (let i = 0; i < rows.length; i += CONCURRENCY) {
      const chunk = rows.slice(i, i + CONCURRENCY);
      const settled = await Promise.all(
        chunk.map((row) => processOne(cadenceLabel, row)),
      );
      results.push(...settled);
    }
  }

  const sent = results.filter((r) => r.result.ok && !("skipped" in r.result && r.result.skipped));
  const skipped = results.filter(
    (r) => r.result.ok && "skipped" in r.result && r.result.skipped,
  );
  const failed = results.filter((r) => !r.result.ok);

  await pingStudio({
    source: "analytics_daily",
    ranAt: now,
    ok: failed.length === 0,
    considered: results.length,
    sent: sent.length,
    skipped: skipped.length,
    failed: failed.length,
    isMondayUtc: isMonday,
  });

  return NextResponse.json({
    ok: true,
    runAt: new Date(now).toISOString(),
    isMondayUTC: isMonday,
    counts: {
      considered: results.length,
      sent: sent.length,
      skipped: skipped.length,
      failed: failed.length,
    },
    // Surface failure reasons but not user PII beyond clerk id (which is opaque).
    failures: failed.map((r) => ({
      userId: r.userId,
      cadence: r.cadence,
      error: !r.result.ok ? r.result.error : null,
    })),
  });
}

