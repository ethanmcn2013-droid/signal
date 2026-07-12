-- A.25, additive discriminated Signal scope.
-- Existing users remain workspace-scoped through linked_workspace_id.

ALTER TABLE analytics_users ADD COLUMN scope_kind TEXT;
ALTER TABLE analytics_users ADD COLUMN planning_period_id TEXT;

UPDATE analytics_users
SET scope_kind = 'workspace'
WHERE linked_workspace_id IS NOT NULL AND scope_kind IS NULL;

CREATE TABLE planning_events (
  id TEXT PRIMARY KEY NOT NULL,
  event_name TEXT NOT NULL,
  scope_kind TEXT NOT NULL,
  workspace_count INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
