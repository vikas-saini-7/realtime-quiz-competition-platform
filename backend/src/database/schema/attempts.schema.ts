import { pgTable, uuid, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { quizzes } from './quizzes.schema';
import { users } from './users.schema';
import { answers } from './answers.schema';

// Attempts Table
export const attempts = pgTable(
  'attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    quizId: uuid('quiz_id')
      .notNull()
      .references(() => quizzes.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    totalScore: integer('total_score').notNull().default(0),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
  },
  (table) => ({
    quizIdIdx: index('attempts_quiz_id_idx').on(table.quizId),
    userIdIdx: index('attempts_user_id_idx').on(table.userId),
    quizUserIdx: index('attempts_quiz_user_idx').on(table.quizId, table.userId),
  }),
);

// Attempt Relations
export const attemptsRelations = relations(attempts, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [attempts.quizId],
    references: [quizzes.id],
  }),
  user: one(users, {
    fields: [attempts.userId],
    references: [users.id],
  }),
  answers: many(answers),
}));

export type Attempt = typeof attempts.$inferSelect;
export type NewAttempt = typeof attempts.$inferInsert;
