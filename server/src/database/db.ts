import 'dotenv/config';

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { schema } from './schema';

const dbUrl = process.env.DATABASE_URL;
console.log('Database URL:', dbUrl);

if (!dbUrl) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({
  connectionString: dbUrl,
});

export const db = drizzle(pool, {
  schema,
});
