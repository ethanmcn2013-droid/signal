/**
 * Cross-tenant isolation guard — Signal (analytics repo).
 *
 * WHY THIS EXISTS (production-readiness audit, 2026-06-18, blocker #2):
 * Notes data is isolated per user purely at the application layer —
 * Turso/libSQL (SQLite) has no row-level security, so the ONLY thing
 * stopping user A from reading user B's notes is a `WHERE user_id = ?`
 * predicate on every query. A single missing scope is a silent
 * cross-tenant leak with no database safety net beneath it.
 *
 * This test is the safety net. It statically scans every server-side
 * data-access file and fails if a read or mutation of an owner-scoped
 * table is not scoped to a tenant identity.
 *
 * HOW IT WORKS. For each owner-scoped table, every `select … .from(t)`,
 * `update(t)`, `delete(t)`, and `insert(t)` statement must EITHER:
 *   - reference a tenant-scope token (userId / clerkId / user_id), or
 *   - carry an explicit `isolation-ok:` justification comment.
 *
 * The escape hatch is deliberate: legitimately global queries exist
 * (cron jobs that process every user). They are allowed — but only
 * when a human has written down WHY, in the statement, where the next
 * reviewer will see it. Unmarked + unscoped = test failure.
 *
 * No DB connection, no server-only imports — pure source inspection,
 * the same approach as milestone.test.ts. Runs under plain `node --test`
 * (no tsx needed). Run: node --test src/server/cross-tenant-isolation.test.mjs
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ── Per-repo configuration ──────────────────────────────────────────────
// Tables whose rows belong to a single tenant. Keep in sync with schema.ts.
const OWNER_TABLES = [
  "analyticsUsers",
  "phrasingRotations",
  "briefingFeedback",
  "userPreferences",
];
// A statement is "scoped" if it mentions any of these tokens.
const SCOPE_TOKENS = ["clerkId", "userId", "user_id", "unsubscribeToken"];
// Minimum owner-table statements we expect to find. If the scan finds
// fewer, the scan itself is broken (wrong path / changed API) and the
// test must fail rather than pass vacuously.
const MIN_EXPECTED_STATEMENTS = 6;

// ── Mechanics ───────────────────────────────────────────────────────────
const OK_MARKER = "isolation-ok";
const serverDir = dirname(fileURLToPath(import.meta.url)); // src/server

function collectSourceFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) {
      if (name === "node_modules") continue;
      out.push(...collectSourceFiles(full));
    } else if (
      (name.endsWith(".ts") || name.endsWith(".tsx")) &&
      !name.includes(".test.") &&
      !name.endsWith(".d.ts")
    ) {
      out.push(full);
    }
  }
  return out;
}

const tableAlt = OWNER_TABLES.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
// Drizzle entry points that read or mutate a table directly by name.
const OP_PATTERNS = [
  { kind: "from", re: new RegExp(`\\.from\\(\\s*(${tableAlt})\\b`, "g") },
  { kind: "update", re: new RegExp(`\\.update\\(\\s*(${tableAlt})\\b`, "g") },
  { kind: "delete", re: new RegExp(`\\.delete\\(\\s*(${tableAlt})\\b`, "g") },
  { kind: "insert", re: new RegExp(`\\.insert\\(\\s*(${tableAlt})\\b`, "g") },
];

/**
 * Split source into coarse statements. Drizzle query chains terminate
 * with `;`, so `;` is a good-enough statement boundary for this guard.
 * Semicolons inside `//` line comments are neutralised first, so a `;`
 * in a waiver/explanatory comment can never split a statement away from
 * its `isolation-ok:` marker.
 */
function statements(src) {
  const safe = src
    .split("\n")
    .map((line) => {
      const c = line.indexOf("//");
      if (c === -1) return line;
      return line.slice(0, c) + line.slice(c).replaceAll(";", "․");
    })
    .join("\n");
  return safe.split(";");
}

function hasScopeToken(text) {
  return SCOPE_TOKENS.some((tok) => text.includes(tok));
}
/**
 * Scoping must be proven in the filter, not the projection. A SELECT that
 * merely returns the userId column (`userId: t.userId`) is NOT scoped —
 * only a `.where(...)` (select/update/delete) or `.values(...)` (insert)
 * that references a tenant token counts.
 */
function isScoped(stmt, kind) {
  if (kind === "insert") {
    const i = stmt.indexOf(".values(");
    return i !== -1 && hasScopeToken(stmt.slice(i));
  }
  const i = stmt.indexOf(".where(");
  return i !== -1 && hasScopeToken(stmt.slice(i));
}
function isWaived(stmt) {
  return stmt.includes(OK_MARKER);
}

// ── The test ────────────────────────────────────────────────────────────
test("every owner-scoped query is tenant-scoped or explicitly waived", () => {
  const files = collectSourceFiles(serverDir);
  const violations = [];
  let scanned = 0;

  for (const file of files) {
    const src = readFileSync(file, "utf8");
    for (const stmt of statements(src)) {
      let touchesOwnerTable = false;
      let table = null;
      let kind = null;
      for (const { kind: k, re } of OP_PATTERNS) {
        re.lastIndex = 0;
        const m = re.exec(stmt);
        if (m) {
          touchesOwnerTable = true;
          table = m[1];
          kind = k;
          break;
        }
      }
      if (!touchesOwnerTable) continue;
      scanned++;

      // insert(): the owner column must be written, so the values must
      // carry a scope token (or be explicitly waived).
      // select/update/delete: must filter by a scope token (or be waived).
      if (!isScoped(stmt, kind) && !isWaived(stmt)) {
        const rel = file.slice(file.indexOf("src"));
        violations.push(`${rel}: ${kind}(${table}) is neither tenant-scoped nor marked "${OK_MARKER}:"`);
      }
    }
  }

  assert.ok(
    scanned >= MIN_EXPECTED_STATEMENTS,
    `Isolation scan only found ${scanned} owner-table statements (expected ≥ ${MIN_EXPECTED_STATEMENTS}). ` +
      `The scanner is probably broken or the data layer moved — fix the guard before trusting it.`,
  );

  assert.deepEqual(
    violations,
    [],
    `Unscoped cross-tenant query (possible data leak):\n  ${violations.join("\n  ")}`,
  );
});
