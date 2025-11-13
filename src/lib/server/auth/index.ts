import { createAuthConfig } from './config';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private';
import { getRequestEvent } from "$app/server";
import type { D1Database } from '@cloudflare/workers-types';
import type { DrizzleClient } from '../db';

export const createAuth = (drizzleClient:DrizzleClient) => {
	return createAuthConfig({
		drizzleClient,
		googleClientId: GOOGLE_CLIENT_ID,
		googleClientSecret: GOOGLE_CLIENT_SECRET,
		isCLI:false,
	});
};

export type BetterAuth = ReturnType<typeof createAuth>;
