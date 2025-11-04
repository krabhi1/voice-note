// auth.cli.ts - This file is only for better-auth CLI usage
import { createAuthConfig } from './src/lib/server/auth/config';

const databaseUrl = process.env.DATABASE_URL!;

export const auth = createAuthConfig({
	databaseUrl,
	googleClientId: process.env.GOOGLE_CLIENT_ID,
	googleClientSecret: process.env.GOOGLE_CLIENT_SECRET
});