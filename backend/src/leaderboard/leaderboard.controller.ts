import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators';
import { User } from '../database/schema';

@Controller('leaderboard')
@UseGuards(JwtAuthGuard)
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get(':quizId')
  async getLeaderboard(
    @Param('quizId') quizId: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.leaderboardService.getTopLeaderboard(quizId, parsedLimit);
  }

  @Get(':quizId/my-position')
  async getMyPosition(@Param('quizId') quizId: string, @CurrentUser() user: User) {
    return this.leaderboardService.getUserPosition(quizId, user.id);
  }
}
