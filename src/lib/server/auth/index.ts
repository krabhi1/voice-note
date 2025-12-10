import { createAuthConfig } from './config';
import { env } from '$env/dynamic/private';
import type { DrizzleClient } from '../db';

export const createAuth = (drizzleClient:DrizzleClient) => {
	return createAuthConfig({
		drizzleClient,
		googleClientId: env.GOOGLE_CLIENT_ID,
		googleClientSecret: env.GOOGLE_CLIENT_SECRET,
		isCLI:false,
	});
};

export type BetterAuth = ReturnType<typeof createAuth>;
