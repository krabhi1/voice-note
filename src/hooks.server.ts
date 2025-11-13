// src/hooks.server.ts

import { building } from '$app/environment';
import { createAuth } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import { createServices } from '$lib/server/services/factory';
import { redirect, type Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';

export const handle: Handle = async ({ event, resolve }) => {
	console.log(event.request.method, event.url.pathname);
	if (building) return resolve(event);

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
			redirect(303, '/sign-in');
		}
	}

	return svelteKitHandler({ event, resolve, auth, building });
};
