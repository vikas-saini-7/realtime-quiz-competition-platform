import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isAutomatic?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  baseScore?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  negativeScore?: number;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}

export class UpdateQuizDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['DRAFT', 'SCHEDULED', 'LIVE', 'COMPLETED'])
  @IsOptional()
  status?: 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'COMPLETED';

  @IsBoolean()
  @IsOptional()
  isAutomatic?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  baseScore?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  negativeScore?: number;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}

export class QuizResponseDto {
  id: string;
  title: string;
  description: string | null;
  hostId: string;
  status: string;
  isAutomatic: boolean;
  baseScore: number;
  negativeScore: number;
  scheduledAt: Date | null;
  createdAt: Date;
  questionCount: number;
}
