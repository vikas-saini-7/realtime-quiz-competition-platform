import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE_CONNECTION, Database } from '../database';
import { answers, Answer, NewAnswer } from '../database/schema';

@Injectable()
export class AnswersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  async create(answerData: NewAnswer): Promise<Answer> {
    const result = await this.db.insert(answers).values(answerData).returning();
    return result[0];
  }

  async findById(id: string): Promise<Answer | null> {
    const result = await this.db
      .select()
      .from(answers)
      .where(eq(answers.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findByAttemptId(attemptId: string): Promise<Answer[]> {
    return this.db.select().from(answers).where(eq(answers.attemptId, attemptId));
  }

  async findByAttemptAndQuestion(
    attemptId: string,
    questionId: string,
  ): Promise<Answer | null> {
    const result = await this.db
      .select()
      .from(answers)
      .where(and(eq(answers.attemptId, attemptId), eq(answers.questionId, questionId)))
      .limit(1);
    return result[0] || null;
  }

  async hasAnswered(attemptId: string, questionId: string): Promise<boolean> {
    const answer = await this.findByAttemptAndQuestion(attemptId, questionId);
    return answer !== null;
  }

  async getAttemptScore(attemptId: string): Promise<number> {
    const attemptAnswers = await this.findByAttemptId(attemptId);
    return attemptAnswers.reduce((sum, answer) => sum + answer.scoreAwarded, 0);
  }
}
