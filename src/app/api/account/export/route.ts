import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db as prefsDb } from "@/server/db";
import { db as libDb } from "@/lib/db";
import { exportAccountData } from "@/server/account-export";

/**
 * GET /api/account/export — Signal.
 *
 * GDPR Art. 20 data portability: the signed-in user downloads a complete
 * machine-readable (JSON) copy of everything Signal holds for them across
 * both Turso DBs. Authed; caller-scoped by Clerk userId. The unsubscribe
 * token is omitted — see account-export.ts.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
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
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "export_failed", message },
      { status: 500 },
    );
  }
}
