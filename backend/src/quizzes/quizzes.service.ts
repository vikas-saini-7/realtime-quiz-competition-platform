import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { DATABASE_CONNECTION, Database } from '../database';
import { quizzes, Quiz, NewQuiz, questions } from '../database/schema';
import { CreateQuizDto, UpdateQuizDto } from './dto';

@Injectable()
export class QuizzesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  private generateQuizCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 3; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += '-';
    for (let i = 0; i < 3; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private async generateUniqueQuizCode(): Promise<string> {
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = this.generateQuizCode();
      const existing = await this.db
        .select()
        .from(quizzes)
        .where(eq(quizzes.code, code))
        .limit(1);

      if (existing.length === 0) {
        return code;
      }
      attempts++;
    } while (attempts < maxAttempts);

    throw new Error('Failed to generate unique quiz code');
  }

  async create(createQuizDto: CreateQuizDto, hostId: string): Promise<Quiz> {
    const code = await this.generateUniqueQuizCode();

    const result = await this.db
      .insert(quizzes)
      .values({
        code,
        title: createQuizDto.title,
        description: createQuizDto.description,
        hostId,
        isAutomatic: createQuizDto.isAutomatic ?? false,
        baseScore: createQuizDto.baseScore ?? 100,
        negativeScore: createQuizDto.negativeScore ?? 25,
        scheduledAt: createQuizDto.scheduledAt
          ? new Date(createQuizDto.scheduledAt)
          : null,
        status: 'DRAFT',
      })
      .returning();
    return result[0];
  }

  async findAll(): Promise<Quiz[]> {
    const result = await this.db
      .select()
      .from(quizzes)
      .orderBy(desc(quizzes.createdAt));

    // Add question count for each quiz
    const quizzesWithCount = await Promise.all(
      result.map(async (quiz) => {
        const questionCount = await this.db
          .select()
          .from(questions)
          .where(eq(questions.quizId, quiz.id));
        return {
          ...quiz,
          questionCount: questionCount.length,
        };
      }),
    );

    return quizzesWithCount;
  }

  async findByHost(hostId: string): Promise<Quiz[]> {
    const result = await this.db
      .select()
      .from(quizzes)
      .where(eq(quizzes.hostId, hostId))
      .orderBy(desc(quizzes.createdAt));

    // Add question count for each quiz
    const quizzesWithCount = await Promise.all(
      result.map(async (quiz) => {
        const questionCount = await this.db
          .select()
          .from(questions)
          .where(eq(questions.quizId, quiz.id));
        return {
          ...quiz,
          questionCount: questionCount.length,
        };
      }),
    );

    return quizzesWithCount;
  }

  async findById(id: string): Promise<Quiz | null> {
    const result = await this.db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findByCode(code: string): Promise<Quiz | null> {
    const result = await this.db
      .select()
      .from(quizzes)
      .where(eq(quizzes.code, code))
      .limit(1);
    return result[0] || null;
  }

  async findByIdWithQuestions(id: string) {
    const quiz = await this.findById(id);
    if (!quiz) {
      return null;
    }

    const quizQuestions = await this.db
      .select()
      .from(questions)
      .where(eq(questions.quizId, id))
      .orderBy(questions.orderIndex);

    return {
      ...quiz,
      questions: quizQuestions,
    };
  }

  async findLiveQuizzes(): Promise<Quiz[]> {
    return this.db
      .select()
      .from(quizzes)
      .where(eq(quizzes.status, 'LIVE'))
      .orderBy(desc(quizzes.createdAt));
  }

  async update(
    id: string,
    updateQuizDto: UpdateQuizDto,
    hostId: string,
  ): Promise<Quiz> {
    const quiz = await this.findById(id);
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.hostId !== hostId) {
      throw new ForbiddenException('You can only update your own quizzes');
    }

    const updateData: Partial<NewQuiz> = {};
    if (updateQuizDto.title !== undefined) {
      updateData.title = updateQuizDto.title;
    }
    if (updateQuizDto.description !== undefined) {
      updateData.description = updateQuizDto.description;
    }
    if (updateQuizDto.status !== undefined) {
      updateData.status = updateQuizDto.status;
    }
    if (updateQuizDto.isAutomatic !== undefined) {
      updateData.isAutomatic = updateQuizDto.isAutomatic;
    }
    if (updateQuizDto.baseScore !== undefined) {
      updateData.baseScore = updateQuizDto.baseScore;
    }
    if (updateQuizDto.negativeScore !== undefined) {
      updateData.negativeScore = updateQuizDto.negativeScore;
    }
    if (updateQuizDto.scheduledAt !== undefined) {
      updateData.scheduledAt = new Date(updateQuizDto.scheduledAt);
    }

    const result = await this.db
      .update(quizzes)
      .set(updateData)
      .where(eq(quizzes.id, id))
      .returning();

    return result[0];
  }

  async updateStatus(
    id: string,
    status: 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'COMPLETED',
  ): Promise<Quiz | null> {
    const result = await this.db
      .update(quizzes)
      .set({ status })
      .where(eq(quizzes.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id: string, hostId: string): Promise<boolean> {
    const quiz = await this.findById(id);
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.hostId !== hostId) {
      throw new ForbiddenException('You can only delete your own quizzes');
    }

    const result = await this.db.delete(quizzes).where(eq(quizzes.id, id)).returning();

    return result.length > 0;
  }
}
