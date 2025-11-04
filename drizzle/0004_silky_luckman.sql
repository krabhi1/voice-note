PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_recording` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`file_url` text NOT NULL,
	`content_type` text NOT NULL,
	`duration` integer NOT NULL,
	`size` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_recording`("id", "user_id", "title", "file_url", "content_type", "duration", "size", "created_at") SELECT "id", "user_id", "title", "file_url", "content_type", "duration", "size", "created_at" FROM `recording`;--> statement-breakpoint
DROP TABLE `recording`;--> statement-breakpoint
ALTER TABLE `__new_recording` RENAME TO `recording`;--> statement-breakpoint
PRAGMA foreign_keys=ON;