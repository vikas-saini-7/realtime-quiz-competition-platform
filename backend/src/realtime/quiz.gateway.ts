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
    quizId?: string;
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
      this.logger.log(`New connection attempt from client ${client.id}`);

      const token = this.extractToken(client);
      if (!token) {
        this.logger.warn(`Client ${client.id} connection rejected: No token provided`);
        client.emit('exception', {
          status: 'error',
          message: 'No authentication token provided',
        });
        client.disconnect();
        return;
      }

      this.logger.log(`Client ${client.id} - Token found, validating...`);
      const user = await this.authService.validateToken(token);
      if (!user) {
        this.logger.warn(
          `Client ${client.id} connection rejected: Invalid or expired token`,
        );
        client.emit('exception', {
          status: 'error',
          message: 'Invalid or expired token',
        });
        client.disconnect();
        return;
      }

      client.data.user = user;
      this.logger.log(
        `User ${user.name} (${user.id}) connected successfully with socket ${client.id}`,
      );

      // Emit authenticated event to notify client that authentication is complete
      client.emit('authenticated', { userId: user.id, userName: user.name });
    } catch (error) {
      this.logger.error(
        `Connection error for client ${client.id}: ${error.message}`,
        error.stack,
      );
      client.emit('exception', { status: 'error', message: 'Authentication failed' });
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    const user = client.data?.user;
    const quizId = client.data?.quizId;

    if (user) {
      this.logger.log(`User ${user.name} disconnected`);

      // If user was in a quiz, remove them
      if (quizId) {
        try {
          await this.quizStateService.removeUserFromQuiz(quizId, user.id);

          const roomName = this.getRoomName(quizId);
          const userCount = await this.quizStateService.getUserCount(quizId);

          // Notify others in the room
          this.server.to(roomName).emit('participant:left', {
            userId: user.id,
            userName: user.name,
            participantCount: userCount,
          });

          this.logger.log(
            `User ${user.name} removed from quiz ${quizId} on disconnect`,
          );
        } catch (error) {
          this.logger.error(`Error removing user on disconnect: ${error.message}`);
        }
      }
    }
  }

  private extractToken(client: Socket): string | null {
    this.logger.debug(`Extracting token for client ${client.id}`);

    const authToken = client.handshake.auth?.token;
    if (authToken) {
      this.logger.debug(`Token found in auth object`);
      return authToken.replace('Bearer ', '');
    }

    const queryToken = client.handshake.query?.token;
    if (queryToken && typeof queryToken === 'string') {
      this.logger.debug(`Token found in query params`);
      return queryToken.replace('Bearer ', '');
    }

    const authHeader = client.handshake.headers?.authorization;
    if (authHeader) {
      this.logger.debug(`Token found in authorization header`);
      return authHeader.replace('Bearer ', '');
    }

    this.logger.debug(`No token found in any location`);
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
    if (!user) {
      throw new WsException('User not authenticated');
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
      quiz.isAutomatic || false,
    );

    // Update quiz status to LIVE
    await this.quizzesService.updateStatus(data.quizId, 'LIVE');

    // Join the quiz room
    const roomName = this.getRoomName(data.quizId);
    client.join(roomName);

    // Get current participant count
    const participantCount = await this.quizStateService.getUserCount(data.quizId);

    // Get current participants list
    const users = await this.quizStateService.getQuizUsers(data.quizId);
    const participants = users.map((user) => ({
      userId: user.userId,
      userName: user.userName,
    }));

    this.logger.log(`Host ${user.name} initialized quiz ${data.quizId}`);

    return {
      success: true,
      quizId: data.quizId,
      state,
      participantCount,
      participants,
    };
  }

  @SubscribeMessage('host:start')
  async handleHostStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { quizId: string },
  ) {
    const user = client.data.user;
    if (!user) {
      throw new WsException('User not authenticated');
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
    if (!user) {
      throw new WsException('User not authenticated');
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
    const questionData = {
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
    };

    this.logger.log(
      `Broadcasting question ${nextIndex + 1}/${state.totalQuestions} to room ${roomName}`,
    );
    this.logger.debug(`Question data: ${JSON.stringify(questionData)}`);

    this.server.to(roomName).emit('quiz:question', questionData);

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
    if (!user) {
      throw new WsException('User not authenticated');
    }

    const state = await this.quizStateService.getQuizState(data.quizId);
    if (!state || state.hostId !== user.id) {
      throw new WsException('Quiz not found or unauthorized');
    }

    await this.handleQuizEnd(data.quizId);

    return { success: true };
  }

  @SubscribeMessage('host:reset-quiz')
  async handleHostResetQuiz(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { quizId: string },
  ) {
    const user = client.data.user;
    if (!user) {
      throw new WsException('User not authenticated');
    }

    const state = await this.quizStateService.getQuizState(data.quizId);
    if (!state || state.hostId !== user.id) {
      throw new WsException('Quiz not found or unauthorized');
    }

    this.logger.log(`Host ${user.name} is resetting quiz ${data.quizId}`);

    // Get question count for reinitialization
    const questionCount = await this.questionsService.getQuestionCount(data.quizId);

    // Clear all quiz-related data
    await this.leaderboardService.clearLeaderboard(data.quizId);
    await this.answersService.deleteByQuizId(data.quizId);
    await this.attemptsService.deleteByQuizId(data.quizId);
    await this.quizStateService.clearQuizState(data.quizId);

    // Reinitialize quiz state
    const newState = await this.quizStateService.initializeQuizState(
      data.quizId,
      user.id,
      questionCount,
    );

    // Notify all participants that quiz has been reset
    const roomName = this.getRoomName(data.quizId);
    this.server.to(roomName).emit('quiz:reset', {
      quizId: data.quizId,
      message: 'Quiz has been reset by the host',
    });

    this.logger.log(`Quiz ${data.quizId} has been reset successfully`);

    return {
      success: true,
      state: newState,
    };
  }

  // ==================== PARTICIPANT EVENTS ====================

  @SubscribeMessage('participant:join')
  async handleParticipantJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { quizId: string },
  ) {
    try {
      const user = client.data.user;
      if (!user) {
        throw new WsException('User not authenticated');
      }

      this.logger.log(`User ${user.name} attempting to join quiz ${data.quizId}`);

      const quiz = await this.quizzesService.findById(data.quizId);
      if (!quiz) {
        throw new WsException('Quiz not found');
      }

      this.logger.log(
        `Quiz found: ${quiz.title}, status: ${quiz.status}, hostId: ${quiz.hostId}`,
      );

      if (quiz.status !== 'LIVE') {
        throw new WsException('Quiz is not live');
      }

      // Get or auto-initialize quiz state
      let state = await this.quizStateService.getQuizState(data.quizId);
      if (!state) {
        // Auto-initialize the quiz state if it doesn't exist
        this.logger.log(`Quiz state not found in Redis, fetching question count...`);
        const questionCount = await this.questionsService.getQuestionCount(data.quizId);
        this.logger.log(`Question count: ${questionCount}`);

        if (questionCount === 0) {
          throw new WsException('Quiz has no questions');
        }

        this.logger.warn(`Auto-initializing quiz state for quiz ${data.quizId}`);
        state = await this.quizStateService.initializeQuizState(
          data.quizId,
          quiz.hostId,
          questionCount,
        );
        this.logger.log(`Quiz state initialized successfully`);
      }

      // Check if user is already in the quiz
      const isAlreadyInQuiz = await this.quizStateService.isUserInQuiz(
        data.quizId,
        user.id,
      );

      // Create or get attempt
      this.logger.log(`Creating/getting attempt for user ${user.id}`);
      const attempt = await this.attemptsService.getOrCreateAttempt(
        user.id,
        data.quizId,
      );
      this.logger.log(`Attempt ID: ${attempt.id}`);

      if (isAlreadyInQuiz) {
        // User is reconnecting - just update their socket ID
        this.logger.log(`User ${user.name} is reconnecting to quiz ${data.quizId}`);
        await this.quizStateService.updateUserSocket(data.quizId, user.id, client.id);
      } else {
        // New participant - add to quiz state
        this.logger.log(
          `User ${user.name} is joining quiz ${data.quizId} for the first time`,
        );
        await this.quizStateService.addUserToQuiz(
          data.quizId,
          user.id,
          user.name,
          client.id,
        );

        // Initialize user in leaderboard with 0 score
        await this.leaderboardService.addOrUpdateScore(
          data.quizId,
          user.id,
          user.name,
          0,
        );
      }

      // Join the quiz room
      const roomName = this.getRoomName(data.quizId);
      client.join(roomName);

      // Store quizId in client data for disconnect handling
      client.data.quizId = data.quizId;

      // Only notify host of new participant if they weren't already in the quiz
      if (!isAlreadyInQuiz) {
        const userCount = await this.quizStateService.getUserCount(data.quizId);
        this.server.to(roomName).emit('participant:joined', {
          userId: user.id,
          userName: user.name,
          participantCount: userCount,
        });
      }

      this.logger.log(`User ${user.name} successfully joined quiz ${data.quizId}`);

      return {
        success: true,
        quizId: data.quizId,
        attemptId: attempt.id,
        quizTitle: quiz.title,
        status: state.status,
        currentQuestionIndex: state.currentQuestionIndex,
      };
    } catch (error) {
      this.logger.error(
        `Error in handleParticipantJoin: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @SubscribeMessage('answer:submit')
  async handleSubmitAnswer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      quizId: string;
      questionId: string;
      selectedOption: 'A' | 'B' | 'C' | 'D';
    },
  ) {
    const user = client.data.user;
    if (!user) {
      throw new WsException('User not authenticated');
    }

    this.logger.log(
      `User ${user.name} submitting answer for question ${data.questionId} in quiz ${data.quizId}`,
    );

    const state = await this.quizStateService.getQuizState(data.quizId);
    if (!state) {
      this.logger.error(`Quiz state not found for quiz ${data.quizId}`);
      throw new WsException('Quiz not found');
    }

    // Get the quiz for scoring information
    const quiz = await this.quizzesService.findById(data.quizId);
    if (!quiz) {
      throw new WsException('Quiz not found');
    }

    this.logger.debug(`Quiz state status: ${state.status}`);

    if (state.status !== 'question') {
      this.logger.warn(
        `Not accepting answers - Quiz status is ${state.status}, expected 'question'`,
      );
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
      scoreAwarded = quiz.baseScore + Math.floor(remainingTime * SPEED_MULTIPLIER);
    } else {
      // Negative marking
      scoreAwarded = -quiz.negativeScore;
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

    this.logger.log(
      `Leaderboard updated - User: ${user.name}, New Total Score: ${newTotalScore}`,
    );

    // Send acknowledgment to participant
    client.emit('answer:received', {
      questionId: data.questionId,
      isCorrect,
      scoreAwarded,
      totalScore: newTotalScore,
    });

    // Broadcast to host/room that participant answered (for real-time question scores)
    const roomName = this.getRoomName(data.quizId);
    this.server.to(roomName).emit('participant:answered', {
      userId: user.id,
      userName: user.name,
      questionId: data.questionId,
      isCorrect,
      scoreAwarded,
      timeTaken: Math.max(0, question.timeLimit * 1000 - remainingTime * 1000),
    });

    this.logger.log(
      `User ${user.name} answered question ${data.questionId}: ${isCorrect ? 'correct' : 'wrong'}, score: ${scoreAwarded}, total: ${newTotalScore}`,
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
    if (!user) {
      throw new WsException('User not authenticated');
    }

    await this.quizStateService.removeUserFromQuiz(data.quizId, user.id);

    const roomName = this.getRoomName(data.quizId);
    client.leave(roomName);

    // Clear quizId from client data
    client.data.quizId = undefined;

    const userCount = await this.quizStateService.getUserCount(data.quizId);
    this.server.to(roomName).emit('participant:left', {
      userId: user.id,
      userName: user.name,
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

    // If quiz is in automatic mode, advance to next question automatically
    if (state.isAutomatic) {
      this.logger.log(
        `Quiz ${quizId} is in automatic mode, advancing to next question in 3 seconds...`,
      );

      // Wait 3 seconds to show results, then advance
      setTimeout(async () => {
        const currentState = await this.quizStateService.getQuizState(quizId);
        if (
          !currentState ||
          currentState.status !== 'between_questions' ||
          currentState.currentQuestionIndex !== questionIndex
        ) {
          return; // Quiz state has changed, don't auto-advance
        }

        const nextIndex = questionIndex + 1;

        // Check if there are more questions
        if (nextIndex >= state.totalQuestions) {
          // Quiz is finished
          await this.handleQuizEnd(quizId);
          return;
        }

        // Advance to next question
        try {
          const nextQuestion = await this.questionsService.findByQuizIdAndOrder(
            quizId,
            nextIndex,
          );

          if (!nextQuestion) {
            this.logger.error(`Question ${nextIndex} not found for quiz ${quizId}`);
            await this.handleQuizEnd(quizId);
            return;
          }

          await this.quizStateService.setCurrentQuestion(
            quizId,
            nextIndex,
            nextQuestion.timeLimit,
          );

          const questionData = {
            questionIndex: nextIndex,
            totalQuestions: state.totalQuestions,
            question: {
              id: nextQuestion.id,
              questionText: nextQuestion.questionText,
              optionA: nextQuestion.optionA,
              optionB: nextQuestion.optionB,
              optionC: nextQuestion.optionC,
              optionD: nextQuestion.optionD,
              timeLimit: nextQuestion.timeLimit,
            },
            startTime: Date.now(),
            endTime: Date.now() + nextQuestion.timeLimit * 1000,
          };

          this.server.to(roomName).emit('quiz:question', questionData);

          this.logger.log(
            `[AUTO] Question ${nextIndex + 1}/${state.totalQuestions} sent for quiz ${quizId}`,
          );

          // Schedule next question end
          setTimeout(async () => {
            await this.handleQuestionTimeUp(quizId, nextIndex);
          }, nextQuestion.timeLimit * 1000);
        } catch (error) {
          this.logger.error(`Error auto-advancing question for quiz ${quizId}:`, error);
        }
      }, 3000); // 3 second delay to show results
    }
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
