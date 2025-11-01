import { createAuth } from './src/lib/server/auth';
import { getDb } from './src/lib/server/db';


const db = getDb({
  //@ts-ignore
	libsqlBinding: process.env.DATABASE_URL!
});
export const auth = createAuth(db);
