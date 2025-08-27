import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class FindAllBooksDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsEnum(['title', 'author', 'uploadedAt', 'avgProgress'])
  sortBy?: 'title' | 'author' | 'uploadedAt' | 'avgProgress';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc';

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

