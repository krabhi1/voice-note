import { createAuthConfig } from './config';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private';
import { getRequestEvent } from "$app/server";
import type { D1Database } from '@cloudflare/workers-types';

export const createAuth = (d1Binding: D1Database) => {
	return createAuthConfig({
		d1Binding,
		googleClientId: GOOGLE_CLIENT_ID,
		googleClientSecret: GOOGLE_CLIENT_SECRET,
		getRequestEvent
	});
};

export type BetterAuth = ReturnType<typeof createAuth>;