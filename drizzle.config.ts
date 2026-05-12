import { config } from "dotenv";
import type { Config } from "drizzle-kit";

// Load .env.local first, then fall back to .env. Mirrors Next.js's
// own env-file precedence so `npm run db:push` works against the
// same vars the dev server uses.
config({ path: ".env.local" });
config({ path: ".env" });

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_ANALYTICS_DATABASE_URL ?? "",
    authToken: process.env.TURSO_ANALYTICS_AUTH_TOKEN,
  },
} satisfies Config;
