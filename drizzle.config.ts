import { defineConfig } from 'drizzle-kit';

import { z } from 'zod';

const envSchema = z.object({
	CLOUDFLARE_ACCOUNT_ID: z.string(),
	CLOUDFLARE_DATABASE_ID: z.string(),
	CLOUDFLARE_D1_TOKEN: z.string()
});

const env = envSchema.parse(process.env);

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'sqlite',
	driver: 'd1-http',
	dbCredentials: {
		accountId: env.CLOUDFLARE_ACCOUNT_ID,
		databaseId: env.CLOUDFLARE_DATABASE_ID,
		token: env.CLOUDFLARE_D1_TOKEN
	},
	verbose: true,
	strict: true
});
