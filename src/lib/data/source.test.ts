/**
 * source.test.ts — Unit tests for _listForUserFromDb identity resolution.
 *
 * Uses an in-memory libSQL database (file::memory:) seeded with Tasks-mirror
 * schema rows. Tests are designed to be:
 *
 *   RED  on the original code (which only matched on clerk_id and would
 *        return [] when clerk_id is NULL even if email matches).
 *   GREEN after the email-first fallback chain is implemented (D1).
 *
 * Three scenarios:
 *   1. email-branch: user row has email set, clerk_id NULL, id != clerkId
 *      → listForUser must return the owned workspace via email match.
 *
 *   2. clerkId-branch: user row has clerk_id set, email NULL, id != clerkId
 *      → listForUser must return the owned workspace via clerk_id match.
 *
 *   3. all-miss: no row matches email, clerk_id, or id=clerkId
 *      → listForUser must return [].
 */

import { describe, it, expect, beforeEach } from "vitest";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { _listForUserFromDb } from "./source";
import * as schema from "@/server/tasks-db/schema";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Create a fresh in-memory libSQL client + Drizzle instance per test. */
function makeDb() {
  const client = createClient({ url: "file::memory:" });
  const db = drizzle(client, { schema });
  return { client, db };
}

/** Run DDL to create the four tables Analytics reads from Tasks's DB. */
async function createTables(client: ReturnType<typeof createClient>) {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id        TEXT PRIMARY KEY,
      clerk_id  TEXT,
      email     TEXT
    );
    CREATE TABLE IF NOT EXISTS workspaces (
      id             TEXT PRIMARY KEY,
      slug           TEXT NOT NULL,
      name           TEXT NOT NULL,
      owner_user_id  TEXT
    );
    CREATE TABLE IF NOT EXISTS workspace_members (
      workspace_id  TEXT NOT NULL,
      user_id       TEXT NOT NULL,
      role          TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id            TEXT PRIMARY KEY,
      workspace_id  TEXT,
      title         TEXT NOT NULL,
      lane          TEXT NOT NULL,
      assignees     TEXT,
      tags          TEXT,
      due           TEXT,
      due_at        INTEGER,
      blocked_by    TEXT,
      created_at    INTEGER NOT NULL,
      updated_at    INTEGER NOT NULL
    );
  `);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("_listForUserFromDb", () => {
  // Each test gets its own isolated in-memory DB so state doesn't bleed.

  /**
   * Scenario 1 — email branch.
   *
   * The Tasks user row was created before the Clerk webhook fired:
   *   - email is set (Tasks writes this at signup)
   *   - clerk_id is NULL (webhook hasn't run yet)
   *   - id is a Tasks-native UUID, NOT the Clerk user id
   *
   * Old code: .where(eq(users.clerkId, externalUserId)) → [] (miss)
   * New code: OR condition includes email match → finds the row → returns workspace.
   *
   * This is the exact production scenario from ISSUE_REGISTER P0-1.
   */
  it("resolves via email when clerk_id is NULL and id != clerkId (webhook-race scenario)", async () => {
    const { client, db } = makeDb();
    await createTables(client);

    const TASKS_USER_ID = "usr_tasks_native_abc123";
    const CLERK_USER_ID = "user_clerk_xyz789"; // different from TASKS_USER_ID
    const USER_EMAIL = "ethan@signalstudio.ie";
    const WS_ID = "ws_hartwell_wedding";

    // Seed: user with email set, clerk_id NULL, id != clerkId
    await client.execute({
      sql: "INSERT INTO users (id, clerk_id, email) VALUES (?, NULL, ?)",
      args: [TASKS_USER_ID, USER_EMAIL],
    });
    await client.execute({
      sql: "INSERT INTO workspaces (id, slug, name, owner_user_id) VALUES (?, ?, ?, ?)",
      args: [WS_ID, "hartwell-wedding", "Hartwell Wedding", TASKS_USER_ID],
    });

    const result = await _listForUserFromDb(db, {
      clerkId: CLERK_USER_ID,
      email: USER_EMAIL,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      workspaceId: WS_ID,
      name: "Hartwell Wedding",
      role: "owner",
    });
  });

  /**
   * Scenario 2 — clerkId-branch.
   *
   * The Tasks user row has clerk_id set but email is NULL (reverse-race).
   * Should still resolve via the clerk_id fallback.
   */
  it("resolves via clerk_id when email is NULL (reverse-race scenario)", async () => {
    const { client, db } = makeDb();
    await createTables(client);

    const TASKS_USER_ID = "usr_tasks_qwerty";
    const CLERK_USER_ID = "user_clerk_abc999";
    const WS_ID = "ws_studio_ops";

    await client.execute({
      sql: "INSERT INTO users (id, clerk_id, email) VALUES (?, ?, NULL)",
      args: [TASKS_USER_ID, CLERK_USER_ID],
    });
    await client.execute({
      sql: "INSERT INTO workspaces (id, slug, name, owner_user_id) VALUES (?, ?, ?, ?)",
      args: [WS_ID, "studio-ops", "Studio Ops", TASKS_USER_ID],
    });

    const result = await _listForUserFromDb(db, {
      clerkId: CLERK_USER_ID,
      email: null, // no email from Clerk
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      workspaceId: WS_ID,
      role: "owner",
    });
  });

  /**
   * Scenario 3 — all-miss.
   *
   * No row matches email, clerk_id, or id=clerkId. Must return [].
   */
  it("returns [] when no match on email, clerk_id, or id (all-miss)", async () => {
    const { client, db } = makeDb();
    await createTables(client);

    // Seed an unrelated user — should not be returned
    await client.execute({
      sql: "INSERT INTO users (id, clerk_id, email) VALUES (?, ?, ?)",
      args: ["usr_other", "user_other_clerk", "other@example.com"],
    });

    const result = await _listForUserFromDb(db, {
      clerkId: "user_completely_unknown",
      email: "nobody@example.com",
    });

    expect(result).toEqual([]);
  });
});
