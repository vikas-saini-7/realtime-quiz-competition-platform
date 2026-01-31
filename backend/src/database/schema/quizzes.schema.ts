import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { questions } from './questions.schema';
import { attempts } from './attempts.schema';

// Quiz Status Enum
export const quizStatusEnum = pgEnum('quiz_status', [
  'DRAFT',
  'SCHEDULED',
  'LIVE',
  'COMPLETED',
]);

// Quizzes Table
export const quizzes = pgTable(
  'quizzes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    hostId: uuid('host_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: quizStatusEnum('status').notNull().default('DRAFT'),
    scheduledAt: timestamp('scheduled_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    hostIdIdx: index('quizzes_host_id_idx').on(table.hostId),
    statusIdx: index('quizzes_status_idx').on(table.status),
  }),
);

// Quiz Relations
export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  host: one(users, {
    fields: [quizzes.hostId],
    references: [users.id],
  }),
  questions: many(questions),
  attempts: many(attempts),
}));

export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;
