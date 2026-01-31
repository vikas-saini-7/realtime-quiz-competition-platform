import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  Max,
} from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  quizId: string;

  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsString()
  @IsNotEmpty()
  optionA: string;

  @IsString()
  @IsNotEmpty()
  optionB: string;

  @IsString()
  @IsNotEmpty()
  optionC: string;

  @IsString()
  @IsNotEmpty()
  optionD: string;

  @IsEnum(['A', 'B', 'C', 'D'])
  correctOption: 'A' | 'B' | 'C' | 'D';

  @IsNumber()
  @Min(5)
  @Max(120)
  @IsOptional()
  timeLimit?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  baseScore?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  negativeScore?: number;

  @IsNumber()
  @Min(0)
  orderIndex: number;
}

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  questionText?: string;

  @IsString()
  @IsOptional()
  optionA?: string;

  @IsString()
  @IsOptional()
  optionB?: string;

  @IsString()
  @IsOptional()
  optionC?: string;

  @IsString()
  @IsOptional()
  optionD?: string;

  @IsEnum(['A', 'B', 'C', 'D'])
  @IsOptional()
  correctOption?: 'A' | 'B' | 'C' | 'D';

  @IsNumber()
  @Min(5)
  @Max(120)
  @IsOptional()
  timeLimit?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  baseScore?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  negativeScore?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  orderIndex?: number;
}

export class BulkCreateQuestionsDto {
  @IsString()
  @IsNotEmpty()
  quizId: string;

  questions: Omit<CreateQuestionDto, 'quizId'>[];
}

export class QuestionResponseDto {
  id: string;
  quizId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  timeLimit: number;
  baseScore: number;
  negativeScore: number;
  orderIndex: number;
}

// Response without correct answer (for participants)
export class QuestionForParticipantDto {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  timeLimit: number;
  orderIndex: number;
}
