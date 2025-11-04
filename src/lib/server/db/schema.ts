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
	title: text('title'),
	file_url: text('file_url'),
	duration: integer('duration'), //in ms
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull()
});

export * from '../auth/schema';

export const note = sqliteTable('note', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	content: text('content'),
});

export *  from '../auth/schema';
