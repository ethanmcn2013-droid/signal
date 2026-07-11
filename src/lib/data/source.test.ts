/** Identity-resolution regression tests.
 *
 * Cross-product authorization is keyed only by the immutable suite subject
 * stored in users.clerk_id. Email is display/delivery data and must never
 * grant access during webhook races or duplicate-address scenarios.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { _listForUserFromDb } from "./source";
import * as schema from "@/server/tasks-db/schema";

function makeDb() {
  const client = createClient({ url: "file::memory:" });
  const db = drizzle(client, { schema });
  return { client, db };
}

async function createTables(client: ReturnType<typeof createClient>) {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, clerk_id TEXT, email TEXT
    );
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY, slug TEXT NOT NULL, name TEXT NOT NULL, owner_user_id TEXT
    );
    CREATE TABLE IF NOT EXISTS workspace_members (
      workspace_id TEXT NOT NULL, user_id TEXT NOT NULL, role TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY, workspace_id TEXT, title TEXT NOT NULL, lane TEXT NOT NULL,
      assignees TEXT, tags TEXT, due TEXT, due_at INTEGER, blocked_by TEXT,
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
  `);
}

describe("_listForUserFromDb immutable subject resolution", () => {
  it("rejects an email-only match when clerk_id is NULL", async () => {
    const { client, db } = makeDb();
    await createTables(client);
    await client.execute({
      sql: "INSERT INTO users (id, clerk_id, email) VALUES (?, NULL, ?)",
      args: ["usr_tasks_native", "shared@example.com"],
    });
    await client.execute({
      sql: "INSERT INTO workspaces (id, slug, name, owner_user_id) VALUES (?, ?, ?, ?)",
      args: ["ws_private", "private", "Private", "usr_tasks_native"],
    });

    const result = await _listForUserFromDb(db, {
      clerkId: "user_target",
      email: "shared@example.com",
    });
    assert.deepEqual(result, []);
  });

  it("resolves only through clerk_id, even when email is NULL", async () => {
    const { client, db } = makeDb();
    await createTables(client);
    await client.execute({
      sql: "INSERT INTO users (id, clerk_id, email) VALUES (?, ?, NULL)",
      args: ["usr_tasks", "user_target"],
    });
    await client.execute({
      sql: "INSERT INTO workspaces (id, slug, name, owner_user_id) VALUES (?, ?, ?, ?)",
      args: ["ws_studio", "studio", "Studio", "usr_tasks"],
    });

    const result = await _listForUserFromDb(db, {
      clerkId: "user_target",
      email: null,
    });
    assert.deepEqual(result, [
      { workspaceId: "ws_studio", name: "Studio", role: "owner" },
    ]);
  });

  it("rejects a duplicate-email row belonging to another subject", async () => {
    const { client, db } = makeDb();
    await createTables(client);
    await client.execute({
      sql: "INSERT INTO users (id, clerk_id, email) VALUES (?, ?, ?)",
      args: ["usr_other", "user_other", "shared@example.com"],
    });
    await client.execute({
      sql: "INSERT INTO workspaces (id, slug, name, owner_user_id) VALUES (?, ?, ?, ?)",
      args: ["ws_other", "other", "Other", "usr_other"],
    });

    const result = await _listForUserFromDb(db, {
      clerkId: "user_target",
      email: "shared@example.com",
    });
    assert.deepEqual(result, []);
  });

  it("returns [] when the immutable subject is not linked", async () => {
    const { client, db } = makeDb();
    await createTables(client);
    await client.execute({
      sql: "INSERT INTO users (id, clerk_id, email) VALUES (?, ?, ?)",
      args: ["usr_other", "user_other", "other@example.com"],
    });

    const result = await _listForUserFromDb(db, {
      clerkId: "user_unknown",
      email: "nobody@example.com",
    });
    assert.deepEqual(result, []);
  });
});
