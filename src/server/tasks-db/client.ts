import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

/**
 * libSQL client for the Signal Tasks Turso DB — READ-ONLY.
 *
 * The Turso auth token used here is scoped read-only on the Tasks DB
 * (created via `turso db tokens create ethanmcnamara-tasks --read-only`).
 * If a query tries to write, the token rejects it. Defense in depth on
 * top of the fact that Analytics has no write paths against this DB.
 *
 * Lazy-initialized on first import so the marketing build still passes
 * when the env vars aren't set in dev.
 */

const url = process.env.TASKS_DATABASE_URL;
const authToken = process.env.TASKS_AUTH_TOKEN;

export const tasksDbConfigured = Boolean(url);

const client = url ? createClient({ url, authToken }) : null;

export const tasksDb = client ? drizzle(client, { schema }) : null;
