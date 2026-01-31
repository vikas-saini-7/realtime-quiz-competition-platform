import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export const createDatabaseConnection = (databaseUrl: string) => {
  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema });
  return db;
};

export type Database = ReturnType<typeof createDatabaseConnection>;
