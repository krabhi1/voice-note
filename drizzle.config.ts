import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { z } from 'zod';
const envSchema = z.discriminatedUnion('NODE_ENV', [
	z.object({
		NODE_ENV: z.literal('production'),
		CLOUDFLARE_ACCOUNT_ID: z.string(),
		CLOUDFLARE_DATABASE_ID: z.string(),
		CLOUDFLARE_D1_TOKEN: z.string()
	}),
	z.object({
		NODE_ENV: z.enum(['development', 'test']).optional(),
		DATABASE_URL: z.string().min(1)
	})
]);

const env = envSchema.parse(process.env);
const isProduction = env.NODE_ENV === 'production';
console.log(`Running in ${env.NODE_ENV} environment`);

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'sqlite',
	...(isProduction && {
		driver: 'd1-http',
		dbCredentials: {
			accountId: env.CLOUDFLARE_ACCOUNT_ID,
			databaseId: env.CLOUDFLARE_DATABASE_ID,
			token: env.CLOUDFLARE_D1_TOKEN
		}
	}),
	...(!isProduction && {
		verbose: true,
		strict: true,
		dbCredentials: {
			url: process.env.DATABASE_URL!
		}
	})
});
