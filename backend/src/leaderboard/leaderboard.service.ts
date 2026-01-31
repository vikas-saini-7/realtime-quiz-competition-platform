import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  score: number;
}

@Injectable()
export class LeaderboardService {
  private readonly LEADERBOARD_KEY_PREFIX = 'leaderboard:';
  private readonly USER_INFO_KEY_PREFIX = 'user_info:';
  private readonly LEADERBOARD_TTL = 86400; // 24 hours

  constructor(private readonly redisService: RedisService) {}

  private getLeaderboardKey(quizId: string): string {
    return `${this.LEADERBOARD_KEY_PREFIX}${quizId}`;
  }

  private getUserInfoKey(quizId: string): string {
    return `${this.USER_INFO_KEY_PREFIX}${quizId}`;
  }

  async addOrUpdateScore(
    quizId: string,
    userId: string,
    userName: string,
    score: number,
  ): Promise<void> {
    const leaderboardKey = this.getLeaderboardKey(quizId);
    const userInfoKey = this.getUserInfoKey(quizId);

    // Add score to sorted set
    await this.redisService.zadd(leaderboardKey, score, userId);
    await this.redisService.expire(leaderboardKey, this.LEADERBOARD_TTL);

    // Store user info in hash
    await this.redisService.hset(userInfoKey, userId, userName);
    await this.redisService.expire(userInfoKey, this.LEADERBOARD_TTL);
  }

  async incrementScore(
    quizId: string,
    userId: string,
    scoreToAdd: number,
  ): Promise<number> {
    const leaderboardKey = this.getLeaderboardKey(quizId);
    const newScore = await this.redisService.zincrby(
      leaderboardKey,
      scoreToAdd,
      userId,
    );
    return newScore;
  }

  async getTopLeaderboard(
    quizId: string,
    limit: number = 10,
  ): Promise<LeaderboardEntry[]> {
    const leaderboardKey = this.getLeaderboardKey(quizId);
    const userInfoKey = this.getUserInfoKey(quizId);

    const entries = await this.redisService.zrevrangeWithScores(
      leaderboardKey,
      0,
      limit - 1,
    );

    const userInfo = await this.redisService.hgetall(userInfoKey);

    return entries.map((entry, index) => ({
      rank: index + 1,
      userId: entry.member,
      userName: userInfo[entry.member] || 'Unknown',
      score: entry.score,
    }));
  }

  async getUserRank(quizId: string, userId: string): Promise<number | null> {
    const leaderboardKey = this.getLeaderboardKey(quizId);
    const rank = await this.redisService.zrank(leaderboardKey, userId);
    return rank !== null ? rank + 1 : null;
  }

  async getUserScore(quizId: string, userId: string): Promise<number | null> {
    const leaderboardKey = this.getLeaderboardKey(quizId);
    const score = await this.redisService.zscore(leaderboardKey, userId);
    return score !== null ? parseFloat(score) : null;
  }

  async getUserPosition(
    quizId: string,
    userId: string,
  ): Promise<{ rank: number; score: number } | null> {
    const rank = await this.getUserRank(quizId, userId);
    const score = await this.getUserScore(quizId, userId);

    if (rank === null || score === null) {
      return null;
    }

    return { rank, score };
  }

  async clearLeaderboard(quizId: string): Promise<void> {
    const leaderboardKey = this.getLeaderboardKey(quizId);
    const userInfoKey = this.getUserInfoKey(quizId);

    await this.redisService.del(leaderboardKey);
    await this.redisService.del(userInfoKey);
  }

  async getParticipantCount(quizId: string): Promise<number> {
    const leaderboardKey = this.getLeaderboardKey(quizId);
    return this.redisService.scard(leaderboardKey);
  }
}
