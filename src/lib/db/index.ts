import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

type DB = ReturnType<typeof drizzle<typeof schema>>;

// Lazy singleton. The env vars are only required when the DB is
// actually touched at request time — building / prerendering pages
// that never query (marketing routes, preview deploys without the
// Signal Turso envs) must not throw at module import.
let _db: DB | null = null;

function getDb(): DB {
  if (_db) return _db;
  const url = process.env.TURSO_ANALYTICS_DATABASE_URL;
  const authToken = process.env.TURSO_ANALYTICS_AUTH_TOKEN;
  if (!url) {
    throw new Error(
      "TURSO_ANALYTICS_DATABASE_URL is not set. Create a Turso database and add the URL to .env.local.",
    );
  }
  _db = drizzle(createClient({ url, authToken }), { schema });
  return _db;
}

// Proxy keeps the `import { db }` call sites unchanged while
// deferring client construction to first real use.
export const db = new Proxy({} as DB, {
  get(_t, prop, receiver) {
    return Reflect.get(getDb() as object, prop, receiver);
  },
}) as DB;
