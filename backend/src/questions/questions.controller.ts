import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto, UpdateQuestionDto, BulkCreateQuestionsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators';
import { User } from '../database/schema';

@Controller('questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  async create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.create(createQuestionDto);
  }

  @Post('bulk')
  async createBulk(@Body() bulkCreateDto: BulkCreateQuestionsDto) {
    return this.questionsService.createBulk(
      bulkCreateDto.quizId,
      bulkCreateDto.questions,
    );
  }

  @Get('quiz/:quizId')
  async findByQuizId(@Param('quizId') quizId: string) {
    return this.questionsService.findByQuizId(quizId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const question = await this.questionsService.findById(id);
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    return question;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
    @CurrentUser() user: User,
  ) {
    return this.questionsService.update(id, updateQuestionDto, user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.questionsService.delete(id, user.id);
    return { message: 'Question deleted successfully' };
  }
}
