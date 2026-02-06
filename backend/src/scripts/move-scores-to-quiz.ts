import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from 'dotenv';
import { quizzes, questions } from '../database/schema';
import { sql } from 'drizzle-orm';

config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const pool = new Pool({ connectionString });
const db = drizzle(pool);

async function moveScoresToQuiz() {
  console.log('Starting migration: Moving scores from questions to quizzes...');

  try {
    // Add baseScore and negativeScore columns to quizzes table
    await db.execute(sql`
      ALTER TABLE quizzes 
      ADD COLUMN IF NOT EXISTS base_score INTEGER NOT NULL DEFAULT 100,
      ADD COLUMN IF NOT EXISTS negative_score INTEGER NOT NULL DEFAULT 25
    `);
    console.log('✓ Added score columns to quizzes table');

    // Remove baseScore and negativeScore columns from questions table
    await db.execute(sql`
      ALTER TABLE questions 
      DROP COLUMN IF EXISTS base_score,
      DROP COLUMN IF EXISTS negative_score
    `);
    console.log('✓ Removed score columns from questions table');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

moveScoresToQuiz()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
