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

  async create(createQuizDto: CreateQuizDto, hostId: string): Promise<Quiz> {
    const result = await this.db
      .insert(quizzes)
      .values({
        title: createQuizDto.title,
        description: createQuizDto.description,
        hostId,
        scheduledAt: createQuizDto.scheduledAt
          ? new Date(createQuizDto.scheduledAt)
          : null,
        status: 'DRAFT',
      })
      .returning();
    return result[0];
  }

  async findAll(): Promise<Quiz[]> {
    return this.db.select().from(quizzes).orderBy(desc(quizzes.createdAt));
  }

  async findByHost(hostId: string): Promise<Quiz[]> {
    return this.db
      .select()
      .from(quizzes)
      .where(eq(quizzes.hostId, hostId))
      .orderBy(desc(quizzes.createdAt));
  }

  async findById(id: string): Promise<Quiz | null> {
    const result = await this.db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, id))
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
