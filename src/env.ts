import "server-only";
import { isDemoMode } from "@/lib/access-mode";

/**
 * Boot-time environment validation for Signal.
 *
 * The audit (2026-06-18) flagged that no repo validates its env, so a
 * missing secret surfaces as a runtime 500 deep in a request instead of a
 * loud failure at boot. This closes that for the variables the app genuinely
 * cannot run without.
 *
 * Behaviour:
 *   - Only enforces in REAL production (`NODE_ENV==='production'` and not
 *     demo/review). Dev/demo/review skip enforcement entirely, those modes
 *     intentionally run without Clerk/Turso.
 *   - REQUIRED vars missing → throws at boot with an aggregated message. A
 *     production deploy without its database or auth keys is non-functional;
 *     refusing to boot is strictly better than 500ing every request.
 *   - RECOMMENDED vars missing → warns (feature degraded) but boots.
 *
 * Dependency-free on purpose (no zod), it's a handful of presence checks,
 * called once from instrumentation.ts `register()`.
 */

// The app cannot serve real users without these.
const REQUIRED_IN_PRODUCTION: ReadonlyArray<readonly [string, string]> = [
  ["TURSO_ANALYTICS_DATABASE_URL", "main analytics database"],
  ["TURSO_ANALYTICS_AUTH_TOKEN", "main analytics database auth token"],
  ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "Clerk auth (browser key)"],
  ["CLERK_SECRET_KEY", "Clerk auth (server key)"],
];

// Specific features break without these, but the app still boots.
const RECOMMENDED_IN_PRODUCTION: ReadonlyArray<readonly [string, string]> = [
  ["TURSO_DATABASE_URL", "user-preferences database"],
  ["RESEND_API_KEY", "briefing + transactional email"],
  ["CRON_SECRET", "daily-briefing cron authentication"],
];

let validated = false;

export function validateEnv(): void {
  if (validated) return;
  validated = true;

  const isProd = process.env.NODE_ENV === "production";
  if (!isProd || isDemoMode()) return; // dev / demo / review: nothing to enforce

  const missingRecommended = RECOMMENDED_IN_PRODUCTION.filter(
    ([key]) => !process.env[key],
  );
  if (missingRecommended.length > 0) {
    console.warn(
      "[env] missing recommended production variables (features degraded):\n" +
        missingRecommended.map(([k, why]) => `  - ${k}, ${why}`).join("\n"),
    );
  }

  const missingRequired = REQUIRED_IN_PRODUCTION.filter(
    ([key]) => !process.env[key],
  );
  if (missingRequired.length > 0) {
    const detail = missingRequired
      .map(([k, why]) => `  - ${k}, ${why}`)
      .join("\n");
    throw new Error(
      `[env] FATAL: missing required production environment variables:\n${detail}\n\n` +
        "Set them in the Vercel project (or run in demo/review mode). Refusing to " +
        "boot a half-configured production environment, this would otherwise 500 " +
        "every authenticated request at runtime instead of failing here, visibly.",
    );
  }
}
