import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('answers')
@UseGuards(JwtAuthGuard)
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Get('attempt/:attemptId')
  async findByAttemptId(@Param('attemptId') attemptId: string) {
    return this.answersService.findByAttemptId(attemptId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.answersService.findById(id);
  }
}
