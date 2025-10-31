// src/hooks.server.ts

import { createDbActions } from '$lib/server/db';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    // 1. Check for the D1 binding
    const db = event.platform?.env.DB;

    if (db) {
        // 2. Initialize the Drizzle Actions object
        const dbActions = createDbActions(db);

        // 3. Attach it to the event.locals object
        // This makes it available to all server-side code (endpoints, server load functions)
        event.locals.db = dbActions;
    } else {
        // Optional: Handle the case where bindings are missing (e.g., in a non-Cloudflare environment)
        console.warn('D1 Database binding (DB) is missing from platform.env.');
    }

    // 4. Continue processing the request
    const response = await resolve(event);
    return response;
};
