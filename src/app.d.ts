import { D1Database } from '@cloudflare/workers-types';
import { createDbActions } from '$lib/server/db';
// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			db: ReturnType<typeof createDbActions>;
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
