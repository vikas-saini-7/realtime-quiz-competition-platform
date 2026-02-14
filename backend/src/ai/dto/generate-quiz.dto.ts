import { IsString, IsIn, IsInt, Min, Max } from 'class-validator';

export class GenerateQuizDto {
  @IsString()
  topic: string;

  @IsIn(['easy', 'medium', 'hard'])
  difficulty: 'easy' | 'medium' | 'hard';

  @IsInt()
  @Min(1)
  @Max(20)
  numberOfQuestions: number;
}
