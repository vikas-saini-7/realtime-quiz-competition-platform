import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAttemptDto {
  @IsString()
  @IsNotEmpty()
  quizId: string;
}

export class AttemptResponseDto {
  id: string;
  quizId: string;
  userId: string;
  totalScore: number;
  joinedAt: Date;
  completedAt: Date | null;
}
