CREATE TABLE `phrasing_rotations` (
	`clerk_id` text NOT NULL,
	`trigger_id` text NOT NULL,
	`last_index` integer DEFAULT 0 NOT NULL,
	`last_fired_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`clerk_id`, `trigger_id`)
);
