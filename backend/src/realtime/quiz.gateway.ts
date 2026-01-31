import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { QuizzesService } from '../quizzes/quizzes.service';
import { QuestionsService } from '../questions/questions.service';
import { AttemptsService } from '../attempts/attempts.service';
import { AnswersService } from '../answers/answers.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { QuizStateService, QuizState } from './quiz-state.service';
import { User } from '../database/schema';

interface AuthenticatedSocket extends Socket {
  data: {
    user: User;
  };
}

// Score calculation constants
const SPEED_MULTIPLIER = 2; // Points per remaining second

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
  namespace: '/quiz',
})
export class QuizGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(QuizGateway.name);

  constructor(
    private readonly authService: AuthService,
    private readonly quizzesService: QuizzesService,
    private readonly questionsService: QuestionsService,
    private readonly attemptsService: AttemptsService,
    private readonly answersService: AnswersService,
    private readonly leaderboardService: LeaderboardService,
    private readonly quizStateService: QuizStateService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        this.logger.warn(`Client ${client.id} connection rejected: No token`);
        client.disconnect();
        return;
      }

      const user = await this.authService.validateToken(token);
      if (!user) {
        this.logger.warn(`Client ${client.id} connection rejected: Invalid token`);
        client.disconnect();
        return;
      }

      client.data.user = user;
      this.logger.log(`User ${user.name} connected with socket ${client.id}`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    const user = client.data?.user;
    if (user) {
      this.logger.log(`User ${user.name} disconnected`);
    }
  }

  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (authToken) {
      return authToken.replace('Bearer ', '');
    }

    const queryToken = client.handshake.query?.token;
    if (queryToken && typeof queryToken === 'string') {
      return queryToken.replace('Bearer ', '');
    }

    const authHeader = client.handshake.headers?.authorization;
    if (authHeader) {
      return authHeader.replace('Bearer ', '');
    }

    return null;
  }

  private getRoomName(quizId: string): string {
    return `quiz:${quizId}`;
  }

  // ==================== HOST EVENTS ====================

  @SubscribeMessage('host:initialize')
  async handleHostInitialize(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { quizId: string },
  ) {
    const user = client.data.user;
    if (user.role !== 'HOST') {
      throw new WsException('Only hosts can initialize quizzes');
    }

    const quiz = await this.quizzesService.findById(data.quizId);
    if (!quiz) {
      throw new WsException('Quiz not found');
    }

    if (quiz.hostId !== user.id) {
      throw new WsException('You can only host your own quizzes');
    }

    const questionCount = await this.questionsService.getQuestionCount(data.quizId);
    if (questionCount === 0) {
      throw new WsException('Quiz has no questions');
    }

    // Initialize quiz state in Redis
    const state = await this.quizStateService.initializeQuizState(
      data.quizId,
      user.id,
      questionCount,
    );

    // Update quiz status to LIVE
    await this.quizzesService.updateStatus(data.quizId, 'LIVE');

    // Join the quiz room
    const roomName = this.getRoomName(data.quizId);
    client.join(roomName);

    this.logger.log(`Host ${user.name} initialized quiz ${data.quizId}`);

    return {
      success: true,
      quizId: data.quizId,
      state,
    };
  }

  @SubscribeMessage('host:start')
  async handleHostStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { quizId: string },
  ) {
    const user = client.data.user;
    if (user.role !== 'HOST') {
      throw new WsException('Only hosts can start quizzes');
    }

    const state = await this.quizStateService.getQuizState(data.quizId);
    if (!state || state.hostId !== user.id) {
      throw new WsException('Quiz not found or unauthorized');
    }

    await this.quizStateService.updateQuizStatus(data.quizId, 'active');

    const roomName = this.getRoomName(data.quizId);
    this.server.to(roomName).emit('quiz:started', {
      quizId: data.quizId,
      message: 'Quiz has started!',
    });

    this.logger.log(`Quiz ${data.quizId} started by host ${user.name}`);

    return { success: true };
  }

  @SubscribeMessage('host:next-question')
  async handleNextQuestion(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { quizId: string },
  ) {
    const user = client.data.user;
    if (user.role !== 'HOST') {
      throw new WsException('Only hosts can advance questions');
    }

    const state = await this.quizStateService.getQuizState(data.quizId);
    if (!state || state.hostId !== user.id) {
      throw new WsException('Quiz not found or unauthorized');
    }

    const nextIndex = state.currentQuestionIndex + 1;
    if (nextIndex >= state.totalQuestions) {
      // Quiz is finished
      await this.handleQuizEnd(data.quizId);
      return { success: true, finished: true };
    }

    // Get the next question
    const question = await this.questionsService.findByQuizIdAndOrder(
      data.quizId,
      nextIndex,
    );

    if (!question) {
      throw new WsException('Question not found');
    }

    // Update state
    await this.quizStateService.setCurrentQuestion(
      data.quizId,
      nextIndex,
      question.timeLimit,
    );

    // Broadcast question to all participants (without correct answer)
    const roomName = this.getRoomName(data.quizId);
    this.server.to(roomName).emit('quiz:question', {
      questionIndex: nextIndex,
      totalQuestions: state.totalQuestions,
      question: {
        id: question.id,
        questionText: question.questionText,
        optionA: question.optionA,
        optionB: question.optionB,
        optionC: question.optionC,
        optionD: question.optionD,
        timeLimit: question.timeLimit,
      },
      startTime: Date.now(),
      endTime: Date.now() + question.timeLimit * 1000,
    });

    this.logger.log(
      `Question ${nextIndex + 1}/${state.totalQuestions} sent for quiz ${data.quizId}`,
    );

    // Schedule question end
    setTimeout(async () => {
      await this.handleQuestionTimeUp(data.quizId, nextIndex);
    }, question.timeLimit * 1000);

    return {
      success: true,
      questionIndex: nextIndex,
    };
  }

  @SubscribeMessage('host:end-quiz')
  async handleHostEndQuiz(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { quizId: string },
  ) {
    const user = client.data.user;
    if (user.role !== 'HOST') {
      throw new WsException('Only hosts can end quizzes');
    }

    const state = await this.quizStateService.getQuizState(data.quizId);
    if (!state || state.hostId !== user.id) {
      throw new WsException('Quiz not found or unauthorized');
    }

    await this.handleQuizEnd(data.quizId);

    return { success: true };
  }

  // ==================== PARTICIPANT EVENTS ====================

  @SubscribeMessage('participant:join')
  async handleParticipantJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { quizId: string },
  ) {
    const user = client.data.user;

    const quiz = await this.quizzesService.findById(data.quizId);
    if (!quiz) {
      throw new WsException('Quiz not found');
    }

    if (quiz.status !== 'LIVE') {
      throw new WsException('Quiz is not live');
    }

    const state = await this.quizStateService.getQuizState(data.quizId);
    if (!state) {
      throw new WsException('Quiz session not active');
    }

    // Create or get attempt
    const attempt = await this.attemptsService.getOrCreateAttempt(user.id, data.quizId);

    // Add user to quiz state
    await this.quizStateService.addUserToQuiz(
      data.quizId,
      user.id,
      user.name,
      client.id,
    );

    // Initialize user in leaderboard with 0 score
    await this.leaderboardService.addOrUpdateScore(data.quizId, user.id, user.name, 0);

    // Join the quiz room
    const roomName = this.getRoomName(data.quizId);
    client.join(roomName);

    // Notify host of new participant
    const userCount = await this.quizStateService.getUserCount(data.quizId);
    this.server.to(roomName).emit('participant:joined', {
      userId: user.id,
      userName: user.name,
      participantCount: userCount,
    });

    this.logger.log(`User ${user.name} joined quiz ${data.quizId}`);

    return {
      success: true,
      quizId: data.quizId,
      attemptId: attempt.id,
      quizTitle: quiz.title,
      status: state.status,
      currentQuestionIndex: state.currentQuestionIndex,
    };
  }

  @SubscribeMessage('participant:answer')
  async handleParticipantAnswer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      quizId: string;
      questionId: string;
      selectedOption: 'A' | 'B' | 'C' | 'D';
    },
  ) {
    const user = client.data.user;

    const state = await this.quizStateService.getQuizState(data.quizId);
    if (!state || state.status !== 'question') {
      throw new WsException('Not accepting answers at this time');
    }

    // Check if time is up
    const remainingTime = await this.quizStateService.getRemainingTime(data.quizId);
    if (remainingTime <= 0) {
      throw new WsException('Time is up for this question');
    }

    // Get the question
    const question = await this.questionsService.findById(data.questionId);
    if (!question) {
      throw new WsException('Question not found');
    }

    // Get user's attempt
    const attempt = await this.attemptsService.findByUserAndQuiz(user.id, data.quizId);
    if (!attempt) {
      throw new WsException('No active attempt found');
    }

    // Check if already answered
    const alreadyAnswered = await this.answersService.hasAnswered(
      attempt.id,
      data.questionId,
    );
    if (alreadyAnswered) {
      throw new WsException('Already answered this question');
    }

    // Calculate time taken
    const timeTaken = state.questionEndTime
      ? state.questionEndTime - Date.now() - remainingTime * 1000
      : question.timeLimit * 1000;

    // Check if answer is correct
    const isCorrect = data.selectedOption === question.correctOption;

    // Calculate score
    let scoreAwarded = 0;
    if (isCorrect) {
      // Base score + speed bonus
      scoreAwarded = question.baseScore + Math.floor(remainingTime * SPEED_MULTIPLIER);
    } else {
      // Negative marking
      scoreAwarded = -question.negativeScore;
    }

    // Save the answer
    await this.answersService.create({
      attemptId: attempt.id,
      questionId: data.questionId,
      selectedOption: data.selectedOption,
      isCorrect,
      timeTaken: Math.max(0, question.timeLimit * 1000 - remainingTime * 1000),
      scoreAwarded,
    });

    // Update attempt total score
    await this.attemptsService.updateScore(attempt.id, scoreAwarded);

    // Update leaderboard
    const newTotalScore = attempt.totalScore + scoreAwarded;
    await this.leaderboardService.addOrUpdateScore(
      data.quizId,
      user.id,
      user.name,
      newTotalScore,
    );

    // Send acknowledgment to participant
    client.emit('answer:received', {
      questionId: data.questionId,
      isCorrect,
      scoreAwarded,
      totalScore: newTotalScore,
    });

    this.logger.log(
      `User ${user.name} answered question ${data.questionId}: ${isCorrect ? 'correct' : 'wrong'}, score: ${scoreAwarded}`,
    );

    return {
      success: true,
      isCorrect,
      scoreAwarded,
      totalScore: newTotalScore,
    };
  }

  @SubscribeMessage('participant:leave')
  async handleParticipantLeave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { quizId: string },
  ) {
    const user = client.data.user;

    await this.quizStateService.removeUserFromQuiz(data.quizId, user.id);

    const roomName = this.getRoomName(data.quizId);
    client.leave(roomName);

    const userCount = await this.quizStateService.getUserCount(data.quizId);
    this.server.to(roomName).emit('participant:left', {
      userId: user.id,
      participantCount: userCount,
    });

    this.logger.log(`User ${user.name} left quiz ${data.quizId}`);

    return { success: true };
  }

  // ==================== SHARED EVENTS ====================

  @SubscribeMessage('leaderboard:get')
  async handleGetLeaderboard(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { quizId: string; limit?: number },
  ) {
    const leaderboard = await this.leaderboardService.getTopLeaderboard(
      data.quizId,
      data.limit || 10,
    );

    return {
      success: true,
      leaderboard,
    };
  }

  // ==================== INTERNAL METHODS ====================

  private async handleQuestionTimeUp(
    quizId: string,
    questionIndex: number,
  ): Promise<void> {
    const state = await this.quizStateService.getQuizState(quizId);
    if (!state || state.currentQuestionIndex !== questionIndex) {
      return; // Question has already changed
    }

    // Get the question to show correct answer
    const question = await this.questionsService.findByQuizIdAndOrder(
      quizId,
      questionIndex,
    );

    await this.quizStateService.updateQuizStatus(quizId, 'between_questions');

    // Get current leaderboard
    const leaderboard = await this.leaderboardService.getTopLeaderboard(quizId, 10);

    // Broadcast time up with correct answer and leaderboard
    const roomName = this.getRoomName(quizId);
    this.server.to(roomName).emit('quiz:question-ended', {
      questionIndex,
      correctOption: question?.correctOption,
      leaderboard,
    });
  }

  private async handleQuizEnd(quizId: string): Promise<void> {
    await this.quizStateService.updateQuizStatus(quizId, 'finished');
    await this.quizzesService.updateStatus(quizId, 'COMPLETED');

    // Get final leaderboard
    const finalLeaderboard = await this.leaderboardService.getTopLeaderboard(
      quizId,
      100,
    );

    // Complete all attempts
    const attempts = await this.attemptsService.findByQuizId(quizId);
    for (const attempt of attempts) {
      await this.attemptsService.complete(attempt.id);
    }

    // Broadcast quiz end with final results
    const roomName = this.getRoomName(quizId);
    this.server.to(roomName).emit('quiz:ended', {
      quizId,
      finalLeaderboard,
    });

    this.logger.log(
      `Quiz ${quizId} ended with ${finalLeaderboard.length} participants`,
    );

    // Cleanup Redis state after a delay
    setTimeout(async () => {
      await this.quizStateService.clearQuizState(quizId);
      await this.leaderboardService.clearLeaderboard(quizId);
    }, 60000); // 1 minute delay
  }
}
