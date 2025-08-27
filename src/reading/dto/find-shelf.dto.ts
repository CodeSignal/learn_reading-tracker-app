import { IsEnum, IsOptional } from 'class-validator';

export class FindShelfDto {
  @IsOptional()
  @IsEnum(['not-started', 'in-progress', 'completed', 'want-to-read'])
  status?: 'not-started' | 'in-progress' | 'completed' | 'want-to-read';

  @IsOptional()
  @IsEnum(['title', 'author', 'updatedAt', 'progress'])
  sortBy?: 'title' | 'author' | 'updatedAt' | 'progress';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc';
}

