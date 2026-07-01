/**
 * Account-erasure integration test — Signal (analytics). GDPR
 * right-to-erasure / App Store 5.1.1(v) guard.
 *
 * Analytics spans TWO Turso DBs (prefs + email-subscription). This runs the
 * REAL `eraseAccountData` against two in-memory libSQL DBs covering all five
 * user-keyed tables, with a bystander user whose rows must survive. The
 * load-bearing assertion is that `briefing_feedback` — which a prior version
 * MISSED — is cleared. A regression that drops that delete fails here.
 *
 * Run: node --import tsx --test src/server/account-erasure.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as prefsSchema from "./db/schema";
import * as libSchema from "../lib/db/schema";
import { eraseAccountData } from "./account-erasure";

async function freshDbs() {
  const prefsClient = createClient({ url: ":memory:" });
  await prefsClient.executeMultiple(`
    CREATE TABLE analytics_users (
      clerk_id text PRIMARY KEY NOT NULL,
      linked_workspace_id text,
      timezone text,
      created_at integer NOT NULL DEFAULT (unixepoch()),
      updated_at integer NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE phrasing_rotations (
      clerk_id text NOT NULL,
      trigger_id text NOT NULL,
      last_index integer NOT NULL DEFAULT 0,
      last_fired_at integer NOT NULL DEFAULT (unixepoch()),
      PRIMARY KEY (clerk_id, trigger_id)
    );
    CREATE TABLE briefing_feedback (
      clerk_id text NOT NULL,
      item_key text NOT NULL,
      verdict text NOT NULL,
      trigger_id text,
      created_at integer NOT NULL DEFAULT (unixepoch()),
      updated_at integer NOT NULL DEFAULT (unixepoch()),
      PRIMARY KEY (clerk_id, item_key)
    );
    CREATE TABLE surfaced_items (
      clerk_id text NOT NULL,
      item_key text NOT NULL,
      trigger_id text NOT NULL,
      first_day integer NOT NULL,
      last_day integer NOT NULL,
      run_days integer NOT NULL DEFAULT 1,
      PRIMARY KEY (clerk_id, item_key, trigger_id)
    );
  `);

  const libClient = createClient({ url: ":memory:" });
  await libClient.executeMultiple(`
    CREATE TABLE user_preferences (
      user_id text PRIMARY KEY NOT NULL,
      email text NOT NULL,
      cadence text NOT NULL DEFAULT 'weekly',
      unsubscribe_token text NOT NULL UNIQUE,
      last_sent_at integer,
      created_at integer NOT NULL DEFAULT (unixepoch() * 1000),
      updated_at integer NOT NULL DEFAULT (unixepoch() * 1000)
    );
  `);

  const prefsDb = drizzle(prefsClient, { schema: prefsSchema });
  const libDb = drizzle(libClient, { schema: libSchema });
  return { prefsClient, libClient, prefsDb, libDb };
}

async function count(client: Client, where: string): Promise<number> {
  const rs = await client.execute(`SELECT COUNT(*) AS c FROM ${where}`);
  return Number(rs.rows[0]!.c);
}

async function seed(prefsClient: Client, libClient: Client) {
  await prefsClient.executeMultiple(`
    INSERT INTO analytics_users (clerk_id, linked_workspace_id) VALUES
      ('u-target','ws-1'), ('u-bystander','ws-2');
    INSERT INTO phrasing_rotations (clerk_id, trigger_id, last_index) VALUES
      ('u-target','blocked',1), ('u-target','overdue',2), ('u-bystander','blocked',1);
    INSERT INTO briefing_feedback (clerk_id, item_key, verdict, trigger_id) VALUES
      ('u-target','item-a','useful','blocked'),
      ('u-target','item-b','not-useful','overdue'),
      ('u-bystander','item-c','useful','blocked');
    INSERT INTO surfaced_items (clerk_id, item_key, trigger_id, first_day, last_day, run_days) VALUES
      ('u-target','item-a','due-soon',20000,20002,3),
      ('u-bystander','item-c','stuck-work',20001,20001,1);
  `);
  await libClient.executeMultiple(`
    INSERT INTO user_preferences (user_id, email, unsubscribe_token) VALUES
      ('u-target','t@x.com','tok-target'),
      ('u-bystander','b@x.com','tok-bystander');
  `);
}

test("erasure clears all five tables across both DBs incl. surfaced_items", async () => {
  const { prefsClient, libClient, prefsDb, libDb } = await freshDbs();
  try {
    await seed(prefsClient, libClient);

    await eraseAccountData(prefsDb, libDb, "u-target");

    // Zero residual for the target across BOTH DBs.
    for (const where of [
      "analytics_users WHERE clerk_id='u-target'",
      "phrasing_rotations WHERE clerk_id='u-target'",
      "briefing_feedback WHERE clerk_id='u-target'",
      "surfaced_items WHERE clerk_id='u-target'",
    ]) {
      assert.equal(await count(prefsClient, where), 0, `residual in ${where}`);
    }
    assert.equal(
      await count(libClient, "user_preferences WHERE user_id='u-target'"),
      0,
      "residual in user_preferences",
    );

    // Bystander fully intact across both DBs.
    assert.equal(await count(prefsClient, "analytics_users"), 1);
    assert.equal(await count(prefsClient, "phrasing_rotations"), 1);
    assert.equal(await count(prefsClient, "briefing_feedback"), 1);
    assert.equal(await count(prefsClient, "surfaced_items"), 1);
    assert.equal(await count(libClient, "user_preferences"), 1);

    // Idempotent.
    await eraseAccountData(prefsDb, libDb, "u-target");
    assert.equal(await count(prefsClient, "analytics_users"), 1);
  } finally {
    prefsClient.close();
    libClient.close();
  }
});

test("erasing an unknown user is a no-op", async () => {
  const { prefsClient, libClient, prefsDb, libDb } = await freshDbs();
  try {
    await seed(prefsClient, libClient);
    await eraseAccountData(prefsDb, libDb, "u-nobody");
    assert.equal(await count(prefsClient, "briefing_feedback"), 3);
    assert.equal(await count(libClient, "user_preferences"), 2);
  } finally {
    prefsClient.close();
    libClient.close();
  }
});
