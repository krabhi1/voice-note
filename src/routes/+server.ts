// src/routes/voice-notes/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, platform }) => {
	// TypeScript now knows 'platform.env' contains DB and ASSETS_BUCKET
	const db = platform?.env.DB;
	const bucket = platform?.env.BUCKET;

	if (!db || !bucket) {
		return json({ message: 'Bindings are missing' }, { status: 500 });
	}

	// Get all files from the bucket
	const files = await bucket.list();

	//get all tables from the database
	const tables = await db.exec("SELECT name FROM sqlite_master WHERE type='table';");
	console.log('Tables in the database:', tables);

	return json({ files: files.objects });
};
