import "server-only";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { sql } from "drizzle-orm";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * ONE-TIME operator migration endpoint — remove after use.
 *
 * Applies drizzle/0002_briefing_feedback.sql and
 * drizzle/0003_surfaced_items.sql (both CREATE TABLE IF NOT EXISTS,
 * idempotent) against the prefs DB the app itself connects to.
 *
 * Why this exists: the Turso credentials are sensitive-flagged in
 * Vercel (write-only) and the turso CLI has no Windows build, so the
 * operator machine cannot reach the DB directly. The deployed app
 * can. Gate mirrors the cron route: bearer OPS_MIGRATE_SECRET with
 * a timing-safe compare; 401 when the secret is unset.
 *
 * Lifecycle: env var added → deploy → single POST → verify → this
 * file deleted and the env var removed in the same operator pass.
 */
export async function POST(req: Request) {
  const secret = process.env.OPS_MIGRATE_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const auth = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  if (
    auth.length !== expected.length ||
    !timingSafeEqual(Buffer.from(auth), Buffer.from(expected))
  ) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  await db.run(
    sql.raw(`CREATE TABLE IF NOT EXISTS briefing_feedback (
      clerk_id    text    NOT NULL,
      item_key    text    NOT NULL,
      verdict     text    NOT NULL,
      trigger_id  text,
      created_at  integer NOT NULL DEFAULT (unixepoch()),
      updated_at  integer NOT NULL DEFAULT (unixepoch()),
      PRIMARY KEY (clerk_id, item_key)
    )`),
  );
  await db.run(
    sql.raw(`CREATE TABLE IF NOT EXISTS surfaced_items (
      clerk_id    text    NOT NULL,
      item_key    text    NOT NULL,
      trigger_id  text    NOT NULL,
      first_day   integer NOT NULL,
      last_day    integer NOT NULL,
      run_days    integer NOT NULL DEFAULT 1,
      PRIMARY KEY (clerk_id, item_key, trigger_id)
    )`),
  );

  const tables = await db.all<{ name: string }>(
    sql.raw(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`),
  );

  return NextResponse.json({
    ok: true,
    tables: tables.map((t) => t.name),
  });
}
