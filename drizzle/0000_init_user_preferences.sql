CREATE TABLE `user_preferences` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`cadence` text DEFAULT 'weekly' NOT NULL,
	`unsubscribe_token` text NOT NULL,
	`last_sent_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_preferences_unsubscribe_token_unique` ON `user_preferences` (`unsubscribe_token`);