import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_ANALYTICS_DATABASE_URL ?? "",
    authToken: process.env.TURSO_ANALYTICS_AUTH_TOKEN,
  },
} satisfies Config;
