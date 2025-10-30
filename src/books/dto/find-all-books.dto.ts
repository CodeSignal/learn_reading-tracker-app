import { IsEnum, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class FindAllBooksDto {
  @IsOptional()
  @IsString()
  q?: string; // case-insensitive title/author search

  @IsOptional()
  @IsEnum(['title', 'author', 'publishDate', 'uploadedAt', 'avgProgress'])
  sortBy?: 'title' | 'author' | 'publishDate' | 'uploadedAt' | 'avgProgress';

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

