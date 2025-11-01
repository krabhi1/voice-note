import { betterAuth } from 'better-auth';
import type { DrizzleClient } from '../db';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private';

import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";

export const createAuth = (db: DrizzleClient) => {
	const auth = betterAuth({
		database: drizzleAdapter(db, {
			provider: 'sqlite'
		}),
		socialProviders: {
      google: {
        clientId: GOOGLE_CLIENT_ID!,
        clientSecret: GOOGLE_CLIENT_SECRET!
      }
		},
		plugins:[
		      sveltekitCookies(getRequestEvent)
		]
	});
	return auth;
};

export type BetterAuth=ReturnType<typeof createAuth>;
