import { Pool } from 'pg';
import 'dotenv/config';

async function migrateQuizCode() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Starting migration...');

    // Add code column
    await pool.query(`
      ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "code" varchar(10);
    `);
    console.log('✓ Added code column');

    // Update existing rows with unique codes
    const result = await pool.query(`
      DO $$
      DECLARE
        quiz_record RECORD;
        new_code TEXT;
      BEGIN
        FOR quiz_record IN SELECT id FROM quizzes WHERE code IS NULL
        LOOP
          LOOP
            new_code := UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 3) || '-' || SUBSTR(MD5(RANDOM()::TEXT), 1, 3));
            BEGIN
              UPDATE quizzes SET code = new_code WHERE id = quiz_record.id;
              EXIT;
            EXCEPTION WHEN unique_violation THEN
              -- Try again with a new code
            END;
          END LOOP;
        END LOOP;
      END $$;
    `);
    console.log('✓ Updated existing quizzes with codes');

    // Make the column NOT NULL
    await pool.query(`
      ALTER TABLE "quizzes" ALTER COLUMN "code" SET NOT NULL;
    `);
    console.log('✓ Set code column to NOT NULL');

    // Add unique constraint if not exists
    await pool.query(`
      DO $$ BEGIN
        ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_code_unique" UNIQUE("code");
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✓ Added unique constraint');

    // Create index on code column
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "quizzes_code_idx" ON "quizzes" ("code");
    `);
    console.log('✓ Created index on code column');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrateQuizCode();
