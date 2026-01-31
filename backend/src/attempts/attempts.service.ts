import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { DATABASE_CONNECTION, Database } from '../database';
import { attempts, Attempt, NewAttempt } from '../database/schema';

@Injectable()
export class AttemptsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  async create(quizId: string, userId: string): Promise<Attempt> {
    const result = await this.db
      .insert(attempts)
      .values({
        quizId,
        userId,
        totalScore: 0,
      })
      .returning();
    return result[0];
  }

  async findById(id: string): Promise<Attempt | null> {
    const result = await this.db
      .select()
      .from(attempts)
      .where(eq(attempts.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findByUserAndQuiz(userId: string, quizId: string): Promise<Attempt | null> {
    const result = await this.db
      .select()
      .from(attempts)
      .where(and(eq(attempts.userId, userId), eq(attempts.quizId, quizId)))
      .limit(1);
    return result[0] || null;
  }

  async findByQuizId(quizId: string): Promise<Attempt[]> {
    return this.db
      .select()
      .from(attempts)
      .where(eq(attempts.quizId, quizId))
      .orderBy(desc(attempts.totalScore));
  }

  async findByUserId(userId: string): Promise<Attempt[]> {
    return this.db
      .select()
      .from(attempts)
      .where(eq(attempts.userId, userId))
      .orderBy(desc(attempts.joinedAt));
  }

  async updateScore(id: string, scoreToAdd: number): Promise<Attempt | null> {
    const attempt = await this.findById(id);
    if (!attempt) {
      return null;
    }

    const result = await this.db
      .update(attempts)
      .set({
        totalScore: attempt.totalScore + scoreToAdd,
      })
      .where(eq(attempts.id, id))
      .returning();

    return result[0] || null;
  }

  async setScore(id: string, totalScore: number): Promise<Attempt | null> {
    const result = await this.db
      .update(attempts)
      .set({ totalScore })
      .where(eq(attempts.id, id))
      .returning();
    return result[0] || null;
  }

  async complete(id: string): Promise<Attempt | null> {
    const result = await this.db
      .update(attempts)
      .set({
        completedAt: new Date(),
      })
      .where(eq(attempts.id, id))
      .returning();
    return result[0] || null;
  }

  async getOrCreateAttempt(userId: string, quizId: string): Promise<Attempt> {
    const existing = await this.findByUserAndQuiz(userId, quizId);
    if (existing) {
      return existing;
    }
    return this.create(quizId, userId);
  }
}
