import "server-only";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";
import { buildBriefing } from "@/lib/briefing/build";
import { getBriefingSource } from "@/lib/briefing/get-source";
import { dispatchBriefing } from "@/lib/email/dispatch";
import { pingStudio } from "@/lib/ops/ping-studio";

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

  const targets = await Promise.all([
    db.select().from(userPreferences).where(eq(userPreferences.cadence, "daily")),
    isMonday
      ? db.select().from(userPreferences).where(eq(userPreferences.cadence, "weekly"))
      : Promise.resolve([]),
  ]);

  const results: Array<{
    userId: string;
    cadence: "daily" | "weekly";
    result: Awaited<ReturnType<typeof dispatchBriefing>>;
  }> = [];

  const source = getBriefingSource();
  const clerk = await clerkClient();
  for (const [cadenceLabel, rows] of [
    ["daily", targets[0]],
    ["weekly", targets[1]],
  ] as const) {
    for (const row of rows) {
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
      results.push({ userId: row.userId, cadence: cadenceLabel, result });
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

