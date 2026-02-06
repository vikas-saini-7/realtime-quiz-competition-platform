import { Pool } from 'pg';
import 'dotenv/config';

async function addIsAutomaticColumn() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Starting migration to add isAutomatic column...');

    // Add is_automatic column with default value
    await pool.query(`
      ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "is_automatic" boolean DEFAULT false NOT NULL;
    `);
    console.log('✓ Added is_automatic column to quizzes table');

    // Drop role column if it exists (cleanup from old schema)
    await pool.query(`
      ALTER TABLE "users" DROP COLUMN IF EXISTS "role";
    `);
    console.log('✓ Cleaned up old role column from users table');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

addIsAutomaticColumn();
