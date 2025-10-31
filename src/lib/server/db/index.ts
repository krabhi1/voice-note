// src/lib/db/index.ts

import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import type { D1Database } from '@cloudflare/workers-types';

export function getDrizzleClient(d1: D1Database) {
	return drizzle(d1, { schema });
}

export function createDbActions(d1: D1Database) {
	const db = getDrizzleClient(d1);
	return {
		getUsers: async () => {
			return await db.query.user.findMany();
		},
		addUser: async (age: number) => {
			return await db.insert(schema.user).values({ age }).returning();
		}
	};
}

export * from './schema';
