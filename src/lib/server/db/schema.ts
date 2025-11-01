import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const note = sqliteTable('note', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	content: text('content'),
});

export *  from '../auth/schema';
