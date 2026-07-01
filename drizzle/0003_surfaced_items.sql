-- surfaced_items — per-item surfacing history for honest carry-over aging
-- (PRODUCT.md §5.3). Lives in the briefing-engine schema
-- (src/server/db/schema.ts), alongside analytics_users, phrasing_rotations
-- and briefing_feedback. The default drizzle.config points at
-- src/lib/db/schema.ts, so this table is NOT picked up by `db:push` against
-- that config — apply this statement directly against the Signal Turso DB:
--
--   turso db shell <signal-db> < drizzle/0003_surfaced_items.sql
--
-- The read/write helpers in src/server/briefing/read-state.ts are fail-safe:
-- until this runs, reads return empty (no aging shown) and writes are caught
-- + logged, never surfaced to the reader.

CREATE TABLE IF NOT EXISTS surfaced_items (
  clerk_id    text    NOT NULL,
  item_key    text    NOT NULL,
  trigger_id  text    NOT NULL,
  first_day   integer NOT NULL,
  last_day    integer NOT NULL,
  run_days    integer NOT NULL DEFAULT 1,
  PRIMARY KEY (clerk_id, item_key, trigger_id)
);
