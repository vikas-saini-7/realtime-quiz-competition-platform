import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { CreateAttemptDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators';
import { User } from '../database/schema';

@Controller('attempts')
@UseGuards(JwtAuthGuard)
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post()
  async create(@Body() createAttemptDto: CreateAttemptDto, @CurrentUser() user: User) {
    return this.attemptsService.getOrCreateAttempt(user.id, createAttemptDto.quizId);
  }

  @Get('my-attempts')
  async findMyAttempts(@CurrentUser() user: User) {
    return this.attemptsService.findByUserId(user.id);
  }

  @Get('quiz/:quizId')
  async findByQuizId(@Param('quizId') quizId: string) {
    return this.attemptsService.findByQuizId(quizId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.attemptsService.findById(id);
  }
}
