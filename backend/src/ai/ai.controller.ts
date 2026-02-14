import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateQuizDto } from './dto/generate-quiz.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  async generateQuiz(@Body() dto: GenerateQuizDto) {
    return await this.aiService.generateQuiz(
      dto.topic,
      dto.difficulty,
      dto.numberOfQuestions,
    );
  }
}
