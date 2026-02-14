import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database';
import { RedisModule } from './redis';
import { AuthModule } from './auth';
import { UsersModule } from './users';
import { QuizzesModule } from './quizzes';
import { QuestionsModule } from './questions';
import { AttemptsModule } from './attempts';
import { AnswersModule } from './answers';
import { LeaderboardModule } from './leaderboard';
import { RealtimeModule } from './realtime';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Core modules
    DatabaseModule,
    RedisModule,

    // Feature modules
    AuthModule,
    UsersModule,
    QuizzesModule,
    QuestionsModule,
    AttemptsModule,
    AnswersModule,
    LeaderboardModule,

    // Real-time module
    RealtimeModule,
    AiModule,
  ],
})
export class AppModule {}
