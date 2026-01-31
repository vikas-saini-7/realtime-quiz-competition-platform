import { pgTable, uuid, varchar, text, integer, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { quizzes } from './quizzes.schema';
import { answers } from './answers.schema';

// Questions Table
export const questions = pgTable(
  'questions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    quizId: uuid('quiz_id')
      .notNull()
      .references(() => quizzes.id, { onDelete: 'cascade' }),
    questionText: text('question_text').notNull(),
    optionA: varchar('option_a', { length: 500 }).notNull(),
    optionB: varchar('option_b', { length: 500 }).notNull(),
    optionC: varchar('option_c', { length: 500 }).notNull(),
    optionD: varchar('option_d', { length: 500 }).notNull(),
    correctOption: varchar('correct_option', { length: 1 }).notNull(), // A, B, C, or D
    timeLimit: integer('time_limit').notNull().default(30), // seconds
    baseScore: integer('base_score').notNull().default(100),
    negativeScore: integer('negative_score').notNull().default(25),
    orderIndex: integer('order_index').notNull(),
  },
  (table) => ({
    quizIdIdx: index('questions_quiz_id_idx').on(table.quizId),
    orderIdx: index('questions_order_idx').on(table.quizId, table.orderIndex),
  }),
);

// Question Relations
export const questionsRelations = relations(questions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.id],
  }),
  answers: many(answers),
}));

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
