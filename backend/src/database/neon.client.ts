import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const createDatabaseConnection = (databaseUrl: string) => {
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  const db = drizzle(pool, { schema });
  return db;
};

export type Database = ReturnType<typeof createDatabaseConnection>;
