// src/hooks.server.ts

import { building } from '$app/environment';
import { createAuth } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import { createServices } from '$lib/server/services/factory';
import { redirect, type Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';
const now = () =>
	typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
export const handle: Handle = async ({ event, resolve }) => {
	const start = now();
	const logTiming = (status?: number | string) => {
		const end = now();
		const duration = end - start;
		console.log(
			`[timing] ${event.request.method} ${event.url.pathname} -> ${status ?? 'unknown'} in ${duration.toFixed(
				2
			)}ms`
		);
	};

	if (building) {
		const res = await resolve(event);
		logTiming(res?.status);
		return res;
	}

	const db = getDb({ d1Binding: event.platform?.env.DB });
	const auth = createAuth(db);

	event.locals.auth = auth;
	event.locals.services = createServices(db, event.platform?.env!);

	if (event.route.id?.startsWith('/app')) {
		const session = await auth.api.getSession({ headers: event.request.headers });
		if (session) {
			event.locals.session = session.session;
			event.locals.user = session.user;
		} else {
			// redirect throws a control-flow exception in SvelteKit
			redirect(303, '/sign-in');
		}
	}

	const response = await svelteKitHandler({ event, resolve, auth, building });
	logTiming(response?.status);

	return response;
};
