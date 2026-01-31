import { Module } from '@nestjs/common';
import { QuizGateway } from './quiz.gateway';
import { QuizStateService } from './quiz-state.service';
import { AuthModule } from '../auth/auth.module';
import { QuizzesModule } from '../quizzes/quizzes.module';
import { QuestionsModule } from '../questions/questions.module';
import { AttemptsModule } from '../attempts/attempts.module';
import { AnswersModule } from '../answers/answers.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';

@Module({
  imports: [
    AuthModule,
    QuizzesModule,
    QuestionsModule,
    AttemptsModule,
    AnswersModule,
    LeaderboardModule,
  ],
  providers: [QuizGateway, QuizStateService],
  exports: [QuizGateway, QuizStateService],
})
export class RealtimeModule {}
