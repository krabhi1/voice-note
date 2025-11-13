// src/lib/db/index.ts

import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';

interface GetDbParams {
	d1Binding?: D1Database;
	databasePath?: string;
}

export type DrizzleD1Client = ReturnType<typeof drizzleD1<typeof schema>>;
export type DrizzleLibsqlClient = ReturnType<typeof drizzleLibsql<typeof schema>>;
export type DrizzleClient = DrizzleD1Client | DrizzleLibsqlClient;

export const getDb = ({ d1Binding, databasePath }: GetDbParams): DrizzleClient => {
	if (d1Binding) {
		return drizzleD1(d1Binding, { schema });
	}
	if (databasePath) {
		return drizzleLibsql(`file:${databasePath}`, { schema });
	}
	throw new Error(`No database binding provided ${JSON.stringify({ d1Binding, databasePath })}`);
};

export * from './schema';
