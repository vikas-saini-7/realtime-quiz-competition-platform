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
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new InternalServerErrorException('OPENROUTER_API_KEY not set');
    }

    // Add randomness to prompt for uniqueness
    const randomSeed = Math.random().toString(36).substring(2, 10);
    const prompt = `
Generate exactly ${numberOfQuestions} unique and creative multiple choice questions about "${topic}" with difficulty "${difficulty}".

Rules:
- 4 options per question
- Only 1 correct answer
- Place the correct answer randomly among the options (not always first)
- Return ONLY valid JSON array
- No markdown
- No explanation
- No extra text
- Make sure each question is different from previous ones
- Use this random seed for uniqueness: ${randomSeed}

Format:
[
  {
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "correctAnswer": "string"
  }
]
`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'openrouter/auto',
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 1,
            top_p: 0.95,
            max_tokens: 800,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'http://localhost:3000',
              'X-Title': 'Quiz-App',
            },
          },
        ),
      );

      const aiOutput = response.data?.choices?.[0]?.message?.content;

      if (!aiOutput) {
        throw new BadRequestException('Empty AI response');
      }

      // Extract JSON safely
      const start = aiOutput.indexOf('[');
      const end = aiOutput.lastIndexOf(']') + 1;

      if (start === -1 || end === -1) {
        throw new BadRequestException('AI did not return valid JSON array');
      }

      const cleanJson = aiOutput.substring(start, end);

      let quiz: QuizQuestion[];

      try {
        quiz = JSON.parse(cleanJson);
      } catch {
        throw new BadRequestException('AI response is not valid JSON');
      }

      // Validation
      if (!Array.isArray(quiz) || quiz.length !== numberOfQuestions) {
        throw new BadRequestException('AI response does not match required format');
      }

      // Shuffle options for each question so correct answer is not always first
      function shuffleArray<T>(array: T[]): T[] {
        const arr = array.slice();
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      }

      quiz = quiz.map((q) => {
        if (
          typeof q.question !== 'string' ||
          !Array.isArray(q.options) ||
          q.options.length !== 4 ||
          typeof q.correctAnswer !== 'string' ||
          !q.options.includes(q.correctAnswer)
        ) {
          throw new BadRequestException('Invalid question format');
        }
        // Shuffle options
        const shuffled = shuffleArray(q.options);
        // Find new correct answer after shuffle
        const newCorrectAnswer =
          shuffled.find((opt) => opt === q.correctAnswer) || shuffled[0];
        return {
          ...q,
          options: shuffled,
          correctAnswer: newCorrectAnswer,
        };
      });

      return quiz;
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        (error as any).response
      ) {
        const errResp = (error as any).response;
        console.error('[OpenRouter Error]', {
          status: errResp.status,
          statusText: errResp.statusText,
          data: errResp.data,
          headers: errResp.headers,
        });
        // Also log the full error object for traceability
        console.error('[OpenRouter Error - Full]', error);
      } else {
        console.error('[AI Service Unexpected Error]', error);
      }

      if (error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException('Failed to generate quiz');
    }
  }
}
