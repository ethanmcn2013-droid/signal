-- Signal progressive analytics, additive state only.
-- No source record content or Note bodies are stored in these tables.

CREATE TABLE IF NOT EXISTS analytics_view_preferences (
  clerk_id text NOT NULL,
  workspace_id text NOT NULL,
  hidden_card_ids text NOT NULL DEFAULT '[]',
  pinned_card_ids text NOT NULL DEFAULT '[]',
  card_order text NOT NULL DEFAULT '[]',
  schema_version integer NOT NULL DEFAULT 1,
  created_at integer NOT NULL DEFAULT (unixepoch()),
  updated_at integer NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (clerk_id, workspace_id)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS analytics_view_preferences_workspace_idx
  ON analytics_view_preferences (workspace_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS analytics_metric_snapshots (
  id text PRIMARY KEY NOT NULL,
  workspace_id text NOT NULL,
  project_id text,
  metric_key text NOT NULL,
  snapshot_at integer NOT NULL,
  numeric_value real,
  aggregate_value text NOT NULL DEFAULT '{}',
  coverage text NOT NULL DEFAULT '{}',
  metric_version text NOT NULL,
  created_at integer NOT NULL DEFAULT (unixepoch()),
  updated_at integer NOT NULL DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS analytics_metric_snapshots_workspace_time_idx
  ON analytics_metric_snapshots (workspace_id, snapshot_at);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS analytics_metric_snapshots_metric_time_idx
  ON analytics_metric_snapshots (workspace_id, metric_key, snapshot_at);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS analytics_metric_snapshots_project_time_idx
  ON analytics_metric_snapshots (workspace_id, project_id, snapshot_at);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS analytics_snapshot_runs (
  id text PRIMARY KEY NOT NULL,
  workspace_id text NOT NULL,
  status text NOT NULL,
  started_at integer NOT NULL,
  completed_at integer,
  source_watermark text,
  coverage text NOT NULL DEFAULT '{}',
  schema_version integer NOT NULL DEFAULT 1,
  error_code text,
  created_at integer NOT NULL DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS analytics_snapshot_runs_workspace_started_idx
  ON analytics_snapshot_runs (workspace_id, started_at);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS analytics_schema_versions (
  stream text PRIMARY KEY NOT NULL,
  version integer NOT NULL,
  updated_at integer NOT NULL DEFAULT (unixepoch())
);
--> statement-breakpoint
INSERT INTO analytics_schema_versions (stream, version, updated_at)
VALUES ('progressive_analytics', 1, unixepoch())
ON CONFLICT(stream) DO UPDATE SET
  version = CASE WHEN excluded.version > version THEN excluded.version ELSE version END,
  updated_at = unixepoch();
