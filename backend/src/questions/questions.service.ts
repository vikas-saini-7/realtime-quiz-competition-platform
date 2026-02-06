import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { eq, and, asc } from 'drizzle-orm';
import { DATABASE_CONNECTION, Database } from '../database';
import { questions, Question, NewQuestion, quizzes } from '../database/schema';
import { CreateQuestionDto, UpdateQuestionDto } from './dto';

@Injectable()
export class QuestionsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const result = await this.db
      .insert(questions)
      .values({
        quizId: createQuestionDto.quizId,
        questionText: createQuestionDto.questionText,
        optionA: createQuestionDto.optionA,
        optionB: createQuestionDto.optionB,
        optionC: createQuestionDto.optionC,
        optionD: createQuestionDto.optionD,
        correctOption: createQuestionDto.correctOption,
        timeLimit: createQuestionDto.timeLimit || 30,
        orderIndex: createQuestionDto.orderIndex,
      })
      .returning();
    return result[0];
  }

  async createBulk(
    quizId: string,
    questionsData: Omit<CreateQuestionDto, 'quizId'>[],
  ): Promise<Question[]> {
    const questionsToInsert: NewQuestion[] = questionsData.map((q) => ({
      quizId,
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctOption: q.correctOption,
      timeLimit: q.timeLimit || 30,
      orderIndex: q.orderIndex,
    }));

    return this.db.insert(questions).values(questionsToInsert).returning();
  }

  async findByQuizId(quizId: string): Promise<Question[]> {
    return this.db
      .select()
      .from(questions)
      .where(eq(questions.quizId, quizId))
      .orderBy(asc(questions.orderIndex));
  }

  async findById(id: string): Promise<Question | null> {
    const result = await this.db
      .select()
      .from(questions)
      .where(eq(questions.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findByQuizIdAndOrder(
    quizId: string,
    orderIndex: number,
  ): Promise<Question | null> {
    const result = await this.db
      .select()
      .from(questions)
      .where(and(eq(questions.quizId, quizId), eq(questions.orderIndex, orderIndex)))
      .limit(1);
    return result[0] || null;
  }

  async getQuestionCount(quizId: string): Promise<number> {
    const result = await this.db
      .select()
      .from(questions)
      .where(eq(questions.quizId, quizId));
    return result.length;
  }

  async update(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
    hostId: string,
  ): Promise<Question> {
    const question = await this.findById(id);
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Verify ownership through quiz
    const quiz = await this.db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, question.quizId))
      .limit(1);

    if (!quiz[0] || quiz[0].hostId !== hostId) {
      throw new ForbiddenException('You can only update questions in your own quizzes');
    }

    const updateData: Partial<NewQuestion> = {};
    if (updateQuestionDto.questionText !== undefined) {
      updateData.questionText = updateQuestionDto.questionText;
    }
    if (updateQuestionDto.optionA !== undefined) {
      updateData.optionA = updateQuestionDto.optionA;
    }
    if (updateQuestionDto.optionB !== undefined) {
      updateData.optionB = updateQuestionDto.optionB;
    }
    if (updateQuestionDto.optionC !== undefined) {
      updateData.optionC = updateQuestionDto.optionC;
    }
    if (updateQuestionDto.optionD !== undefined) {
      updateData.optionD = updateQuestionDto.optionD;
    }
    if (updateQuestionDto.correctOption !== undefined) {
      updateData.correctOption = updateQuestionDto.correctOption;
    }
    if (updateQuestionDto.timeLimit !== undefined) {
      updateData.timeLimit = updateQuestionDto.timeLimit;
    }
    if (updateQuestionDto.orderIndex !== undefined) {
      updateData.orderIndex = updateQuestionDto.orderIndex;
    }

    const result = await this.db
      .update(questions)
      .set(updateData)
      .where(eq(questions.id, id))
      .returning();

    return result[0];
  }

  async delete(id: string, hostId: string): Promise<boolean> {
    const question = await this.findById(id);
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Verify ownership through quiz
    const quiz = await this.db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, question.quizId))
      .limit(1);

    if (!quiz[0] || quiz[0].hostId !== hostId) {
      throw new ForbiddenException(
        'You can only delete questions from your own quizzes',
      );
    }

    const result = await this.db
      .delete(questions)
      .where(eq(questions.id, id))
      .returning();

    return result.length > 0;
  }

  async deleteByQuizId(quizId: string): Promise<void> {
    await this.db.delete(questions).where(eq(questions.quizId, quizId));
  }
}
