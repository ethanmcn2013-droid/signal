import { mockBriefingSource } from "./mock-source";
import type { BriefingSource } from "./source";
import { makeTasksDbSource } from "./tasks-db-source";

/**
 * Runtime source selection. If the Tasks read-only Turso env vars
 * are set, return a real Tasks DB reader. Otherwise fall back to
 * the mock (Wedding 2026 demo) — useful in dev and as a
 * "no-real-data" graceful degrade in production.
 *
 * Cached per server process so we don't recreate the libsql client
 * on every request.
 */
let cached: BriefingSource | null = null;

export function getBriefingSource(): BriefingSource {
  if (cached) return cached;
  const real = makeTasksDbSource();
  cached = real ?? mockBriefingSource;
  return cached;
}

/**
 * For tests / preview-email surfaces that want the demo regardless
 * of env. Don't reach for this in production cron — it bypasses
 * the cross-product join.
 */
export function getMockSource(): BriefingSource {
  return mockBriefingSource;
}
