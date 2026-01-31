import { IsString, IsNotEmpty, IsNumber, IsEnum, Min } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  @IsNotEmpty()
  attemptId: string;

  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsEnum(['A', 'B', 'C', 'D'])
  selectedOption: 'A' | 'B' | 'C' | 'D';

  @IsNumber()
  @Min(0)
  timeTaken: number; // milliseconds
}

export class AnswerResponseDto {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOption: string | null;
  isCorrect: boolean;
  timeTaken: number;
  scoreAwarded: number;
}
