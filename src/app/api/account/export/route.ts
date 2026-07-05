import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db as prefsDb } from "@/server/db";
import { db as libDb } from "@/lib/db";
import { exportAccountData } from "@/server/account-export";
import { allow } from "@/lib/ratelimit";

/**
 * GET /api/account/export, Signal.
 *
 * GDPR Art. 20 data portability: the signed-in user downloads a complete
 * machine-readable (JSON) copy of everything Analytics holds for them across
 * both Turso DBs. Authed; caller-scoped by Clerk userId. The unsubscribe
 * token is omitted, see account-export.ts.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Throttle this data-exfiltration-sensitive endpoint per user. A full
  // account export is heavy and legitimately needed only a handful of times;
  // capping it bounds how fast a hijacked session could repeatedly pull the
  // entire account. No-ops until Upstash is provisioned (see lib/ratelimit.ts).
  if (!(await allow("account-export", userId, 10, "1 h"))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  try {
    const data = await exportAccountData(prefsDb, libDb, userId);
    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="signal-export-${userId}.json"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    // Log the detail server-side (flows to Vercel function logs + Sentry via
    // instrumentation's onRequestError); return an opaque error so internal
    // exception text (DB errors, connection details) never reaches the client.
    console.error(`[account/export] failed for user ${userId}:`, err);
    return NextResponse.json({ error: "export_failed" }, { status: 500 });
  }
}
