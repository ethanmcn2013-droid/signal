import assert from "node:assert/strict";
import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
assert.equal(
  pkg.scripts?.["db:signal:migrate"],
  "drizzle-kit migrate --config=drizzle.signal.config.ts",
  "Signal state must use its dedicated additive migration config",
);

const migration = fs.readFileSync(
  "drizzle-signal/0000_progressive_analytics.sql",
  "utf8",
);
for (const table of [
  "analytics_view_preferences",
  "analytics_metric_snapshots",
  "analytics_snapshot_runs",
  "analytics_schema_versions",
]) {
  assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`));
}
assert.doesNotMatch(migration, /DROP\s+(?:TABLE|COLUMN)|DELETE\s+FROM/i);
assert.doesNotMatch(migration, /note_body|extract_body|source_title/i);
console.log("signal-migration-contract: additive, content-minimising stream ok");
