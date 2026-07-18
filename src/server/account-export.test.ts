/**
 * Account-export integration test, Signal (analytics). GDPR Art. 20.
 *
 * Two in-memory libSQL DBs (prefs + lib) with a bystander user; asserts the
 * export is caller-scoped across both DBs and never includes the unsubscribe
 * token.
 *
 * Run: node --import tsx --test src/server/account-export.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as prefsSchema from "./db/schema";
import * as libSchema from "../lib/db/schema";
import { exportAccountData } from "./account-export";

async function freshDbs() {
  const prefsClient = createClient({ url: ":memory:" });
  await prefsClient.executeMultiple(`
    CREATE TABLE analytics_users (
      clerk_id text PRIMARY KEY NOT NULL, linked_workspace_id text,
      scope_kind text, planning_period_id text, timezone text,
      created_at integer NOT NULL DEFAULT (unixepoch()),
      updated_at integer NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE phrasing_rotations (
      clerk_id text NOT NULL, trigger_id text NOT NULL,
      last_index integer NOT NULL DEFAULT 0,
      last_fired_at integer NOT NULL DEFAULT (unixepoch()),
      PRIMARY KEY (clerk_id, trigger_id)
    );
    CREATE TABLE briefing_feedback (
      clerk_id text NOT NULL, item_key text NOT NULL, verdict text NOT NULL,
      trigger_id text,
      created_at integer NOT NULL DEFAULT (unixepoch()),
      updated_at integer NOT NULL DEFAULT (unixepoch()),
      PRIMARY KEY (clerk_id, item_key)
    );
    CREATE TABLE surfaced_items (
      clerk_id text NOT NULL, item_key text NOT NULL, trigger_id text NOT NULL,
      first_day integer NOT NULL, last_day integer NOT NULL,
      run_days integer NOT NULL DEFAULT 1,
      PRIMARY KEY (clerk_id, item_key, trigger_id)
    );
    INSERT INTO analytics_users (clerk_id, linked_workspace_id) VALUES
      ('u-target','ws-1'), ('u-bystander','ws-2');
    INSERT INTO phrasing_rotations (clerk_id, trigger_id, last_index) VALUES
      ('u-target','blocked',1), ('u-bystander','blocked',1);
    INSERT INTO briefing_feedback (clerk_id, item_key, verdict) VALUES
      ('u-target','item-a','useful'), ('u-bystander','item-c','useful');
    INSERT INTO surfaced_items (clerk_id, item_key, trigger_id, first_day, last_day, run_days) VALUES
      ('u-target','item-a','due-soon',20000,20002,3),
      ('u-bystander','item-c','stuck-work',20001,20001,1);
  `);

  const libClient = createClient({ url: ":memory:" });
  await libClient.executeMultiple(`
    CREATE TABLE user_preferences (
      user_id text PRIMARY KEY NOT NULL, email text NOT NULL,
      cadence text NOT NULL DEFAULT 'weekly',
      unsubscribe_token text NOT NULL UNIQUE, last_sent_at integer,
      created_at integer NOT NULL DEFAULT (unixepoch() * 1000),
      updated_at integer NOT NULL DEFAULT (unixepoch() * 1000)
    );
    INSERT INTO user_preferences (user_id, email, unsubscribe_token) VALUES
      ('u-target','t@x.com','UNSUB-SECRET'), ('u-bystander','b@x.com','tok-b');
  `);

  return {
    prefsClient,
    libClient,
    prefsDb: drizzle(prefsClient, { schema: prefsSchema }),
    libDb: drizzle(libClient, { schema: libSchema }),
  };
}

test("export is caller-scoped across both DBs and omits the unsubscribe token", async () => {
  const { prefsClient, libClient, prefsDb, libDb } = await freshDbs();
  try {
    const data = await exportAccountData(prefsDb, libDb, "u-target");

    assert.equal(data.account?.clerkId, "u-target");
    assert.equal(data.phrasingRotations.length, 1);
    assert.equal(data.briefingFeedback.length, 1);
    assert.equal(data.surfacedItems.length, 1);
    assert.equal(data.surfacedItems[0]?.itemKey, "item-a");
    assert.equal(data.emailSubscription?.email, "t@x.com");

    assert.ok(
      !JSON.stringify(data).includes("UNSUB-SECRET"),
      "unsubscribe token leaked into export",
    );
  } finally {
    (prefsClient as Client).close();
    (libClient as Client).close();
  }
});
