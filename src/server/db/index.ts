import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

/**
 * libSQL client for Analytics's own prefs DB.
 *
 * Separate Turso DB from the Tasks DB Analytics reads from, Analytics
 * is read-only against Tasks, write-only against this one.
 *
 * Local dev with no Turso env falls back to a local SQLite file so
 * the marketing build still runs offline. In Vercel, the env vars
 * are required.
 */
if (process.env.VERCEL === "1" && !process.env.TURSO_DATABASE_URL) {
  throw new Error(
    "TURSO_DATABASE_URL is required in Vercel environments (analytics prefs DB)",
  );
}

const url = process.env.TURSO_DATABASE_URL ?? "file:analytics.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });
export { schema };
