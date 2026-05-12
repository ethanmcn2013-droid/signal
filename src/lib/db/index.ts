import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.TURSO_ANALYTICS_DATABASE_URL;
const authToken = process.env.TURSO_ANALYTICS_AUTH_TOKEN;

if (!url) {
  throw new Error(
    "TURSO_ANALYTICS_DATABASE_URL is not set. Create a Turso database and add the URL to .env.local.",
  );
}

const client = createClient({ url, authToken });
export const db = drizzle(client, { schema });
