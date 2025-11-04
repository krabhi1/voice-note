import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';
import { user } from '../auth/schema';
export const recording = sqliteTable('recording', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	file_url: text('file_url').notNull(),
	content_type: text('content_type').notNull(), //mime type like audio/mpeg, audio/wav
	duration: integer('duration').notNull(), //in ms
	size: integer('size').notNull(), //in bytes
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull()
});

export type Recording = typeof recording.$inferSelect;
export type NewRecording = typeof recording.$inferInsert;

export * from '../auth/schema';
