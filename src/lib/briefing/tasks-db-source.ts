import "server-only";
import { createClient, type Client } from "@libsql/client";
import type { BriefingContext, BriefingSource } from "./source";
import type { Lane, TaskSignal } from "./types";

const DAY = 86_400_000;

/**
 * Reads the signed-in user's Tasks workspaces and maps them to
 * TaskSignal[]. Joins on EMAIL (Tasks/Analytics may live in
 * different Clerk apps; clerk_id wouldn't match across them).
 *
 * Read-only by design — the token used here must be a Turso
 * read-only token. The data flow is Analytics ← Tasks; never the
 * other way.
 *
 * Engine fields produced from the real DB:
 *   - lane:        canonicalised todo/doing/review/done → next/in-flight/in-flight/shipped
 *   - priority:    "P0"|"P1"|"P2"|"P3" string → 0|1|2|3 number
 *   - dueAt:       passed through (unix ms or null)
 *   - idleDays:    passed through (Tasks pre-computes this)
 *   - blockedBy:   JSON-parsed; defaults to []
 *   - commentCount:set to 0 for v1 — a JOIN on comments per task is
 *                 measurable cost and the engine doesn't use this in
 *                 v1 triggers
 *   - sourceLabel: "Tasks · {workspace.name}"
 *   - movedToShippedAt: heuristic — lane='done' AND idleDays<1 →
 *                 (now - idleDays*DAY), else null. Phase B.3 will
 *                 replace this with a real activities-table read.
 */
export function makeTasksDbSource(): BriefingSource | null {
  const url = process.env.TASKS_DATABASE_URL;
  const authToken = process.env.TASKS_AUTH_TOKEN;
  if (!url || !authToken) return null;

  const client: Client = createClient({ url, authToken });

  return {
    async getSignalsForUser(ctx: BriefingContext): Promise<TaskSignal[]> {
      // Resolve email → Tasks user_id. Email is the cross-product key.
      const userRow = await client.execute({
        sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
        args: [ctx.email],
      });
      const tasksUserId = userRow.rows[0]?.id;
      if (!tasksUserId) return [];

      // Get all tasks in workspaces this user belongs to.
      // Limit 200 — defends the engine if a workspace is huge; the
      // cap-3-per-bucket renderer doesn't need more than that.
      const result = await client.execute({
        sql: `
          SELECT
            t.id           AS id,
            t.title        AS title,
            t.lane         AS lane,
            t.priority     AS priority,
            t.due_at       AS due_at,
            t.idle_days    AS idle_days,
            t.blocked_by   AS blocked_by,
            w.name         AS workspace_name
          FROM tasks t
          INNER JOIN workspaces w ON w.id = t.workspace_id
          WHERE t.workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = ?
          )
          LIMIT 200
        `,
        args: [String(tasksUserId)],
      });

      const now = Date.now();
      const signals: TaskSignal[] = [];
      for (const row of result.rows) {
        const lane = canonicaliseLane(row.lane as string);
        const priority = parsePriority(row.priority as string);
        const idleDays = Number(row.idle_days ?? 0);
        const blockedBy = parseBlockedBy(row.blocked_by as string | null);
        const movedToShippedAt =
          lane === "shipped" && idleDays < 1 ? now - idleDays * DAY : null;
        signals.push({
          id: String(row.id),
          title: String(row.title),
          lane,
          priority,
          dueAt: row.due_at != null ? Number(row.due_at) : null,
          idleDays,
          commentCount: 0,
          blockedBy,
          sourceLabel: `Tasks · ${row.workspace_name}`,
          movedToShippedAt,
        });
      }
      return signals;
    },
  };
}

function canonicaliseLane(raw: string): Lane {
  switch (raw) {
    case "todo":
      return "next";
    case "doing":
    case "review":
      return "in-flight";
    case "done":
      return "shipped";
    default:
      return "next";
  }
}

function parsePriority(raw: string): 0 | 1 | 2 | 3 {
  const m = /^P([0-3])$/.exec(raw ?? "");
  if (m) return Number(m[1]) as 0 | 1 | 2 | 3;
  // Tasks pre-2024 uses numeric strings; tolerate them.
  const n = Number(raw);
  if (n >= 0 && n <= 3) return n as 0 | 1 | 2 | 3;
  return 2;
}

function parseBlockedBy(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    if (Array.isArray(v)) return v.map(String);
    return [];
  } catch {
    return [];
  }
}
