-- briefing_feedback — per-item useful/not-useful signal (PRODUCT.md §2.4).
-- Lives in the briefing-engine schema (src/server/db/schema.ts), alongside
-- analytics_users + phrasing_rotations. The default drizzle.config points at
-- src/lib/db/schema.ts, so this table is NOT picked up by `db:push` against
-- that config — apply this statement directly against the Signal Turso DB:
--
--   turso db shell <signal-db> < drizzle/0002_briefing_feedback.sql
--
-- The recordBriefingFeedback server action is fail-safe: until this runs, taps
-- are acknowledged in the UI and the insert is caught + logged, never surfaced.

CREATE TABLE IF NOT EXISTS briefing_feedback (
  clerk_id    text    NOT NULL,
  item_key    text    NOT NULL,
  verdict     text    NOT NULL,
  trigger_id  text,
  created_at  integer NOT NULL DEFAULT (unixepoch()),
  updated_at  integer NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (clerk_id, item_key)
);
