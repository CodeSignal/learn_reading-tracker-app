import { IsInt, Min, IsOptional, IsEnum, IsUUID } from 'class-validator';

export class UpdateProgressDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  bookId!: string;

  @IsInt()
  @Min(0)
  currentPage!: number;

  @IsOptional()
  @IsEnum(['not-started', 'in-progress', 'completed', 'want-to-read'])
  status?: 'not-started' | 'in-progress' | 'completed' | 'want-to-read';
}
