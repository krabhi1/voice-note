import { D1Database } from '@cloudflare/workers-types';
import { createDbActions } from '$lib/server/db';
import type { BetterAuth } from '$lib/server/auth';
import type { User, Session } from 'better-auth';
// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			db: ReturnType<typeof createDbActions>;
			auth: BetterAuth;
			session?: Session;
			user?: User;
		}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				DB: D1Database;
				BUCKET: R2Bucket;
			};
		}
	}
}

export {};
