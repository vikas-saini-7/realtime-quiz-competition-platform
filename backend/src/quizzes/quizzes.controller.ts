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
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, UpdateQuizDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators';
import { User } from '../database/schema';

@Controller('quizzes')
@UseGuards(JwtAuthGuard)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  async create(@Body() createQuizDto: CreateQuizDto, @CurrentUser() user: User) {
    return this.quizzesService.create(createQuizDto, user.id);
  }

  @Get()
  async findAll() {
    return this.quizzesService.findAll();
  }

  @Get('my-quizzes')
  async findMyQuizzes(@CurrentUser() user: User) {
    return this.quizzesService.findByHost(user.id);
  }

  @Get('live')
  async findLiveQuizzes() {
    return this.quizzesService.findLiveQuizzes();
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    const quiz = await this.quizzesService.findByCode(code);
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    return quiz;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const quiz = await this.quizzesService.findById(id);
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    return quiz;
  }

  @Get(':id/with-questions')
  async findOneWithQuestions(@Param('id') id: string) {
    const quiz = await this.quizzesService.findByIdWithQuestions(id);
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    return quiz;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateQuizDto: UpdateQuizDto,
    @CurrentUser() user: User,
  ) {
    return this.quizzesService.update(id, updateQuizDto, user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.quizzesService.delete(id, user.id);
    return { message: 'Quiz deleted successfully' };
  }
}
