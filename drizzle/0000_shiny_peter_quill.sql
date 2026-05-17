CREATE TABLE `analytics_users` (
	`clerk_id` text PRIMARY KEY NOT NULL,
	`linked_workspace_id` text,
	`timezone` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
