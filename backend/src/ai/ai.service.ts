import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

@Injectable()
export class AiService {
  constructor(private readonly httpService: HttpService) {}

  async generateQuiz(
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    numberOfQuestions: number,
  ): Promise<QuizQuestion[]> {
    const HF_TOKEN = process.env.HF_TOKEN;
    if (!HF_TOKEN) {
      throw new InternalServerErrorException('HF_TOKEN not set');
    }

    const prompt = `You are an expert quiz creator. Generate ${numberOfQuestions} multiple choice questions about '${topic}' with difficulty '${difficulty}'. Rules: 4 options each, only 1 correct answer, clear and concise wording, return ONLY valid JSON array, no explanation, no markdown, no extra text. Format: [{"question": "", "options": ["", "", "", ""], "correctAnswer": ""}]`;

    try {
      const response: any = await firstValueFrom(
        this.httpService.post(
          'https://api-inference.huggingface.co/models/google/flan-t5-large',
          { inputs: prompt },
          {
            headers: {
              Authorization: `Bearer ${HF_TOKEN}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      const aiOutput =
        response?.data?.[0]?.generated_text ||
        response?.data?.generated_text ||
        response?.data;
      let quiz: QuizQuestion[];
      try {
        quiz = JSON.parse(aiOutput);
      } catch {
        throw new BadRequestException('AI response is not valid JSON');
      }
      if (!Array.isArray(quiz) || quiz.length !== numberOfQuestions) {
        throw new BadRequestException('AI response does not match required format');
      }
      for (const q of quiz) {
        if (
          typeof q.question !== 'string' ||
          !Array.isArray(q.options) ||
          q.options.length !== 4 ||
          typeof q.correctAnswer !== 'string' ||
          !q.options.includes(q.correctAnswer)
        ) {
          throw new BadRequestException('Invalid question format');
        }
      }
      return quiz;
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to generate quiz');
    }
  }
}
