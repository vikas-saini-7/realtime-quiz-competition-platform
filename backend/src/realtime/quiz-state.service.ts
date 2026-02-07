import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

export interface QuizState {
  quizId: string;
  hostId: string;
  status: 'waiting' | 'active' | 'question' | 'between_questions' | 'finished';
  currentQuestionIndex: number;
  totalQuestions: number;
  isAutomatic: boolean;
  questionStartTime: number | null;
  questionEndTime: number | null;
}

export interface JoinedUser {
  userId: string;
  userName: string;
  socketId: string;
  joinedAt: number;
}

@Injectable()
export class QuizStateService {
  private readonly logger = new Logger(QuizStateService.name);
  private readonly QUIZ_STATE_PREFIX = 'quiz_state:';
  private readonly QUIZ_USERS_PREFIX = 'quiz_users:';
  private readonly USER_SOCKET_PREFIX = 'user_socket:';
  private readonly STATE_TTL = 86400; // 24 hours

  constructor(private readonly redisService: RedisService) {}

  private getStateKey(quizId: string): string {
    return `${this.QUIZ_STATE_PREFIX}${quizId}`;
  }

  private getUsersKey(quizId: string): string {
    return `${this.QUIZ_USERS_PREFIX}${quizId}`;
  }

  private getUserSocketKey(quizId: string, userId: string): string {
    return `${this.USER_SOCKET_PREFIX}${quizId}:${userId}`;
  }

  // Quiz State Management
  async initializeQuizState(
    quizId: string,
    hostId: string,
    totalQuestions: number,
    isAutomatic: boolean = false,
  ): Promise<QuizState> {
    const state: QuizState = {
      quizId,
      hostId,
      status: 'waiting',
      currentQuestionIndex: -1,
      totalQuestions,
      isAutomatic,
      questionStartTime: null,
      questionEndTime: null,
    };

    await this.setQuizState(quizId, state);
    return state;
  }

  async getQuizState(quizId: string): Promise<QuizState | null> {
    const stateKey = this.getStateKey(quizId);
    const data = await this.redisService.hgetall(stateKey);

    if (!data || Object.keys(data).length === 0) {
      return null;
    }

    return {
      quizId: data.quizId,
      hostId: data.hostId,
      status: data.status as QuizState['status'],
      currentQuestionIndex: parseInt(data.currentQuestionIndex, 10),
      totalQuestions: parseInt(data.totalQuestions, 10),
      isAutomatic: data.isAutomatic === 'true',
      questionStartTime: data.questionStartTime
        ? parseInt(data.questionStartTime, 10)
        : null,
      questionEndTime: data.questionEndTime ? parseInt(data.questionEndTime, 10) : null,
    };
  }

  async setQuizState(quizId: string, state: QuizState): Promise<void> {
    const stateKey = this.getStateKey(quizId);
    const data: Record<string, string> = {
      quizId: state.quizId,
      hostId: state.hostId,
      status: state.status,
      currentQuestionIndex: state.currentQuestionIndex.toString(),
      totalQuestions: state.totalQuestions.toString(),
      isAutomatic: state.isAutomatic.toString(),
      questionStartTime: state.questionStartTime?.toString() || '',
      questionEndTime: state.questionEndTime?.toString() || '',
    };

    for (const [field, value] of Object.entries(data)) {
      await this.redisService.hset(stateKey, field, value);
    }
    await this.redisService.expire(stateKey, this.STATE_TTL);
  }

  async updateQuizStatus(quizId: string, status: QuizState['status']): Promise<void> {
    const stateKey = this.getStateKey(quizId);
    await this.redisService.hset(stateKey, 'status', status);
  }

  async setCurrentQuestion(
    quizId: string,
    questionIndex: number,
    timeLimit: number,
  ): Promise<void> {
    const stateKey = this.getStateKey(quizId);
    const now = Date.now();
    const endTime = now + timeLimit * 1000;

    await this.redisService.hset(
      stateKey,
      'currentQuestionIndex',
      questionIndex.toString(),
    );
    await this.redisService.hset(stateKey, 'status', 'question');
    await this.redisService.hset(stateKey, 'questionStartTime', now.toString());
    await this.redisService.hset(stateKey, 'questionEndTime', endTime.toString());
  }

  // User Management
  async addUserToQuiz(
    quizId: string,
    userId: string,
    userName: string,
    socketId: string,
  ): Promise<void> {
    const usersKey = this.getUsersKey(quizId);
    const userSocketKey = this.getUserSocketKey(quizId, userId);

    const userInfo: JoinedUser = {
      userId,
      userName,
      socketId,
      joinedAt: Date.now(),
    };

    await this.redisService.hset(usersKey, userId, JSON.stringify(userInfo));
    await this.redisService.set(userSocketKey, socketId, this.STATE_TTL);
    await this.redisService.expire(usersKey, this.STATE_TTL);
  }

  async removeUserFromQuiz(quizId: string, userId: string): Promise<void> {
    const usersKey = this.getUsersKey(quizId);
    const userSocketKey = this.getUserSocketKey(quizId, userId);

    await this.redisService.hdel(usersKey, userId);
    await this.redisService.del(userSocketKey);
  }

  async getQuizUsers(quizId: string): Promise<JoinedUser[]> {
    const usersKey = this.getUsersKey(quizId);
    const data = await this.redisService.hgetall(usersKey);

    return Object.values(data).map((value) => {
      // Handle both string and already-parsed object
      if (typeof value === 'string') {
        return JSON.parse(value);
      }
      return value as JoinedUser;
    });
  }

  async getUserCount(quizId: string): Promise<number> {
    const users = await this.getQuizUsers(quizId);
    return users.length;
  }

  async isUserInQuiz(quizId: string, userId: string): Promise<boolean> {
    const usersKey = this.getUsersKey(quizId);
    const userData = await this.redisService.hget(usersKey, userId);
    return userData !== null;
  }

  async getUserSocket(quizId: string, userId: string): Promise<string | null> {
    const userSocketKey = this.getUserSocketKey(quizId, userId);
    return this.redisService.get(userSocketKey);
  }

  async updateUserSocket(
    quizId: string,
    userId: string,
    socketId: string,
  ): Promise<void> {
    const usersKey = this.getUsersKey(quizId);
    const userData = await this.redisService.hget(usersKey, userId);

    if (userData) {
      // Handle both string and already-parsed object (Upstash Redis auto-deserializes JSON)
      const user: JoinedUser =
        typeof userData === 'string'
          ? JSON.parse(userData)
          : (userData as unknown as JoinedUser);
      user.socketId = socketId;
      await this.redisService.hset(usersKey, userId, JSON.stringify(user));
    }

    const userSocketKey = this.getUserSocketKey(quizId, userId);
    await this.redisService.set(userSocketKey, socketId, this.STATE_TTL);
  }

  // Cleanup
  async clearQuizState(quizId: string): Promise<void> {
    const stateKey = this.getStateKey(quizId);
    const usersKey = this.getUsersKey(quizId);

    await this.redisService.del(stateKey);
    await this.redisService.del(usersKey);
    await this.redisService.deleteByPattern(`${this.USER_SOCKET_PREFIX}${quizId}:*`);
  }

  // Calculate remaining time for current question
  async getRemainingTime(quizId: string): Promise<number> {
    const state = await this.getQuizState(quizId);
    if (!state || !state.questionEndTime) {
      return 0;
    }

    const remaining = state.questionEndTime - Date.now();
    return Math.max(0, Math.floor(remaining / 1000));
  }
}
