import { config } from "dotenv";
import type { Config } from "drizzle-kit";

config({ path: ".env.local" });
config({ path: ".env" });

/** Separate, additive migration stream for Signal application state. */
export default {
  schema: "./src/server/db/schema.ts",
  out: "./drizzle-signal",
  dialect: "turso",
  tablesFilter: [
    "analytics_view_preferences",
    "analytics_metric_snapshots",
    "analytics_snapshot_runs",
    "analytics_schema_versions",
  ],
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL ?? "",
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
} satisfies Config;
