import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import type { D1Database } from '@cloudflare/workers-types';
import * as schema from './schema';
import { sveltekitCookies } from "better-auth/svelte-kit";

interface CreateAuthOptions {
	d1Binding?: D1Database;
	databaseUrl?: string;
	googleClientId?: string;
	googleClientSecret?: string;
	getRequestEvent?: () => any;
}

export function createAuthConfig({
	d1Binding,
	databaseUrl,
	googleClientId = 'dummy',
	googleClientSecret = 'dummy',
	getRequestEvent
}: CreateAuthOptions) {
	let db;
	
	if (d1Binding) {
		// Production/Runtime with D1 binding
		db = drizzleD1(d1Binding, { schema });
	} else if (databaseUrl) {
		// CLI or local development
		db = drizzleLibsql(`file:${databaseUrl}`, { schema });
	} else {
		throw new Error('Either d1Binding or databaseUrl must be provided');
	}

	const config: any = {
		database: drizzleAdapter(db, { provider: 'sqlite' }),
		socialProviders: {
			google: {
				clientId: googleClientId,
				clientSecret: googleClientSecret
			}
		}
	};

	// Only add SvelteKit plugins if getRequestEvent is provided (runtime context)
	if (getRequestEvent) {
		config.plugins = [sveltekitCookies(getRequestEvent)];
	}

	return betterAuth(config);
}