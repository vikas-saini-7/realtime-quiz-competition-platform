import { pgTable, uuid, varchar, boolean, integer, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { attempts } from './attempts.schema';
import { questions } from './questions.schema';

// Answers Table
export const answers = pgTable(
  'answers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    attemptId: uuid('attempt_id')
      .notNull()
      .references(() => attempts.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => questions.id, { onDelete: 'cascade' }),
    selectedOption: varchar('selected_option', { length: 1 }), // A, B, C, D or null if not answered
    isCorrect: boolean('is_correct').notNull().default(false),
    timeTaken: integer('time_taken').notNull(), // milliseconds
    scoreAwarded: integer('score_awarded').notNull().default(0),
  },
  (table) => ({
    attemptIdIdx: index('answers_attempt_id_idx').on(table.attemptId),
    questionIdIdx: index('answers_question_id_idx').on(table.questionId),
    attemptQuestionIdx: index('answers_attempt_question_idx').on(
      table.attemptId,
      table.questionId,
    ),
  }),
);

// Answer Relations
export const answersRelations = relations(answers, ({ one }) => ({
  attempt: one(attempts, {
    fields: [answers.attemptId],
    references: [attempts.id],
  }),
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
}));

export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;
