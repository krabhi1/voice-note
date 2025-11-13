import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import type { DrizzleClient } from '../db';
import { getRequestEvent } from '$app/server';

interface CreateAuthOptions {
	googleClientId?: string;
	googleClientSecret?: string;
	drizzleClient: DrizzleClient;
	isCLI: boolean;
}

export function createAuthConfig({
	drizzleClient,
	googleClientId = 'dummy',
	googleClientSecret = 'dummy',
	isCLI = false
}: CreateAuthOptions) {
	return betterAuth({
		database: drizzleAdapter(drizzleClient, { provider: 'sqlite' }),
		socialProviders: {
			google: {
				clientId: googleClientId,
				clientSecret: googleClientSecret
			}
		},
		...(!isCLI ? { plugins: [sveltekitCookies(getRequestEvent)] } : {})
	});
}
