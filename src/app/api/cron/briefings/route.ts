import "server-only";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";
import { buildBriefing } from "@/lib/briefing/build";
import { getBriefingSource } from "@/lib/briefing/get-source";
import { dispatchBriefing } from "@/lib/email/dispatch";

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
 * Source: mockBriefingSource for v1 (Phase B.1). Phase B.2 will
 * replace this with a real Tasks DB read. The cron handler itself
 * doesn't change.
 */
export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
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
  for (const [cadenceLabel, rows] of [
    ["daily", targets[0]],
    ["weekly", targets[1]],
  ] as const) {
    for (const row of rows) {
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
      });
      results.push({ userId: row.userId, cadence: cadenceLabel, result });
    }
  }

  const sent = results.filter((r) => r.result.ok && !("skipped" in r.result && r.result.skipped));
  const skipped = results.filter(
    (r) => r.result.ok && "skipped" in r.result && r.result.skipped,
  );
  const failed = results.filter((r) => !r.result.ok);

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

// Vercel cron sends GET by default unless configured otherwise; accept both.
export const GET = POST;
