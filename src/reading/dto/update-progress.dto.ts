import { IsInt, Min, IsOptional, IsEnum } from 'class-validator';

export class UpdateProgressDto {
  @IsInt()
  userId!: number;

  @IsInt()
  bookId!: number;

  @IsInt()
  @Min(0)
  currentPage!: number;

  @IsOptional()
  @IsEnum(['not-started', 'in-progress', 'completed', 'want-to-read'])
  status?: 'not-started' | 'in-progress' | 'completed' | 'want-to-read';
}

