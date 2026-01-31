import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';

// Role Enum
export const userRoleEnum = pgEnum('user_role', ['HOST', 'USER']);

// Users Table
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role: userRoleEnum('role').notNull().default('USER'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
