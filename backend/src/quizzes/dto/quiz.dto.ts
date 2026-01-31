import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

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
  scheduledAt: Date | null;
  createdAt: Date;
  questionCount?: number;
}
